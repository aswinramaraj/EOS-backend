import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ROLES } from 'src/common/constants/roles.constant';
import { paginate } from 'src/common/dto/pagination.dto';
import type { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';
import { CreateSalaryDivisionDto } from './dto/create-salary-division.dto';
import { UpdateSalaryDivisionDto } from './dto/update-salary-division.dto';
import { ListSalaryDivisionQueryDto } from './dto/list-salary-division-query.dto';

function prismaErrorCode(err: unknown): string | undefined {
  return typeof err === 'object' && err !== null && 'code' in err
    ? (err as { code?: string }).code
    : undefined;
}

const SALARY_DIVISION_SELECT = {
  id: true,
  division_name: true,
  amount: true,
  effective_from: true,
  faculty: {
    select: { id: true, first_name: true, last_name: true, designation: true },
  },
} as const;

interface SalaryDivisionRow {
  id: number;
  division_name: string;
  amount: unknown;
  effective_from: Date;
  faculty: {
    id: number;
    first_name: string;
    last_name: string;
    designation: string;
  };
}

function toResponse(row: SalaryDivisionRow) {
  return {
    id: row.id,
    division_name: row.division_name,
    amount: row.amount,
    effective_from: row.effective_from,
    faculty: row.faculty,
  };
}

@Injectable()
export class SalaryDivisionsService {
  private readonly logger = new Logger(SalaryDivisionsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** POST /salary-divisions (HR Payroll only). */
  async create(dto: CreateSalaryDivisionDto) {
    const faculty = await this.prisma.faculty.findUnique({
      where: { id: dto.faculty_id },
    });
    if (!faculty) {
      throw new NotFoundException('Faculty not found');
    }

    const division = await this.prisma.salary_divisions.create({
      data: {
        faculty_id: dto.faculty_id,
        division_name: dto.division_name,
        amount: dto.amount,
        effective_from: new Date(dto.effective_from),
      },
      select: SALARY_DIVISION_SELECT,
    });

    this.logger.log(
      `Salary division created: id=${division.id} faculty=${dto.faculty_id} name=${dto.division_name}`,
    );
    return toResponse(division);
  }

  /** GET /salary-divisions (HR Payroll all / Faculty own only). */
  async findAll(query: ListSalaryDivisionQueryDto, currentUser: JwtPayload) {
    const where: Record<string, unknown> = {
      faculty_id: query.faculty_id,
      division_name: query.division_name,
    };

    if (currentUser.role === ROLES.FACULTY) {
      const faculty = await this.resolveFacultyByUserId(currentUser.sub);
      where.faculty_id = faculty.id;
    }

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.salary_divisions.findMany({
        where,
        skip: query.skip,
        take: query.limit,
        orderBy: { effective_from: 'desc' },
        select: SALARY_DIVISION_SELECT,
      }),
      this.prisma.salary_divisions.count({ where }),
    ]);

    return paginate(rows.map(toResponse), total, query);
  }

  /** GET /salary-divisions/:id (HR Payroll all / Faculty own only). */
  async findOne(id: number, currentUser: JwtPayload) {
    const division = await this.prisma.salary_divisions.findUnique({
      where: { id },
      select: SALARY_DIVISION_SELECT,
    });
    if (!division) {
      throw new NotFoundException('Salary division not found');
    }

    if (currentUser.role === ROLES.FACULTY) {
      const faculty = await this.resolveFacultyByUserId(currentUser.sub);
      if (division.faculty.id !== faculty.id) {
        throw new ForbiddenException(
          'You may only view your own salary divisions',
        );
      }
    }

    return toResponse(division);
  }

  /** PATCH /salary-divisions/:id (HR Payroll only). */
  async update(id: number, dto: UpdateSalaryDivisionDto) {
    if (!dto || Object.keys(dto).length === 0) {
      throw new BadRequestException('No fields provided to update');
    }

    try {
      const division = await this.prisma.salary_divisions.update({
        where: { id },
        data: {
          division_name: dto.division_name,
          amount: dto.amount,
          effective_from: dto.effective_from
            ? new Date(dto.effective_from)
            : undefined,
        },
        select: SALARY_DIVISION_SELECT,
      });

      return toResponse(division);
    } catch (err: unknown) {
      if (prismaErrorCode(err) === 'P2025') {
        throw new NotFoundException('Salary division not found');
      }
      throw err;
    }
  }

  /**
   * DELETE /salary-divisions/:id (HR Payroll only).
   * The schema has no soft-delete flag on this table, so this is a hard delete.
   */
  async remove(id: number) {
    try {
      await this.prisma.salary_divisions.delete({ where: { id } });
    } catch (err: unknown) {
      if (prismaErrorCode(err) === 'P2025') {
        throw new NotFoundException('Salary division not found');
      }
      throw err;
    }

    this.logger.log(`Salary division deleted: id=${id}`);
    return { id, deleted: true };
  }

  private async resolveFacultyByUserId(userId: number) {
    const faculty = await this.prisma.faculty.findUnique({
      where: { user_id: userId },
    });
    if (!faculty) {
      throw new NotFoundException(
        'Faculty profile not found for the authenticated user',
      );
    }
    return faculty;
  }
}
