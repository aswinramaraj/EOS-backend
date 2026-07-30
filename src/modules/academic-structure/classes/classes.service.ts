import {
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { AssignMentorDto } from './dto/assign-mentor.dto';

function prismaErrorCode(err: unknown): string | undefined {
  return typeof err === 'object' && err !== null && 'code' in err
    ? (err as { code?: string }).code
    : undefined;
}

const MENTOR_SELECT = {
  id: true,
  class_id: true,
  faculty_id: true,
  academic_year: true,
  assigned_by_user_id: true,
  faculty: {
    select: { id: true, first_name: true, last_name: true, designation: true },
  },
} as const;

@Injectable()
export class ClassesService {
  private readonly logger = new Logger(ClassesService.name);

  constructor(private readonly prisma: PrismaService) {}

  create(createClassDto: CreateClassDto) {
    void createClassDto;
    return 'This action adds a new class';
  }

  findAll() {
    return `This action returns all classes`;
  }

  findOne(id: number) {
    return `This action returns a #${id} class`;
  }

  update(id: number, updateClassDto: UpdateClassDto) {
    void updateClassDto;
    return `This action updates a #${id} class`;
  }

  remove(id: number) {
    return `This action removes a #${id} class`;
  }

  /**
   * POST /classes/:id/mentor (HoD only, own department).
   *
   * workflow.md: "HoD assigns the class with a respective faculty as
   * Mentor." class_mentors has @@unique([class_id, academic_year]) — the DB
   * itself enforces one mentor per class per year, so a duplicate create
   * surfaces as a real P2002, translated here to a friendly 409. No
   * cross-department restriction on the faculty side — neither schema nor
   * workflow.md requires the mentor to belong to the same department as
   * the class.
   */
  async assignMentor(classId: number, dto: AssignMentorDto, userId: number) {
    const hod = await this.resolveFacultyByUserId(userId);
    await this.assertClassInDepartment(classId, hod.department_id);
    await this.assertFacultyExists(dto.faculty_id);

    try {
      const mentor = await this.prisma.class_mentors.create({
        data: {
          class_id: classId,
          faculty_id: dto.faculty_id,
          academic_year: dto.academic_year,
          assigned_by_user_id: userId,
        },
        select: MENTOR_SELECT,
      });

      this.logger.log(
        `Class mentor assigned: class=${classId} faculty=${dto.faculty_id} year=${dto.academic_year}`,
      );
      return mentor;
    } catch (err: unknown) {
      if (prismaErrorCode(err) === 'P2002') {
        throw new ConflictException({
          message:
            'This class already has a mentor assigned for this academic year',
          errorCode: 'MENTOR_ALREADY_ASSIGNED',
        });
      }
      throw err;
    }
  }

  /**
   * PATCH /classes/:id/mentor (HoD only, own department).
   * Reassignment is a distinct action from initial assignment — it targets
   * the existing (class_id, academic_year) row rather than creating a new
   * one, and 404s if that row doesn't exist yet (use POST first).
   */
  async reassignMentor(classId: number, dto: AssignMentorDto, userId: number) {
    const hod = await this.resolveFacultyByUserId(userId);
    await this.assertClassInDepartment(classId, hod.department_id);
    await this.assertFacultyExists(dto.faculty_id);

    try {
      const mentor = await this.prisma.class_mentors.update({
        where: {
          class_id_academic_year: {
            class_id: classId,
            academic_year: dto.academic_year,
          },
        },
        data: { faculty_id: dto.faculty_id, assigned_by_user_id: userId },
        select: MENTOR_SELECT,
      });

      this.logger.log(
        `Class mentor reassigned: class=${classId} faculty=${dto.faculty_id} year=${dto.academic_year}`,
      );
      return mentor;
    } catch (err: unknown) {
      if (prismaErrorCode(err) === 'P2025') {
        throw new NotFoundException({
          message:
            'No mentor assignment exists for this class in that academic year',
          errorCode: 'MENTOR_NOT_ASSIGNED',
        });
      }
      throw err;
    }
  }

  /**
   * GET /classes/:id/mentor (Admin/HoD/Faculty).
   * `academic_year` omitted returns the full assignment history — the
   * schema has no "current academic year" flag anywhere, so there's no
   * column to default against.
   */
  async getMentor(classId: number, academicYear?: string) {
    await this.assertClassExists(classId);

    return this.prisma.class_mentors.findMany({
      where: {
        class_id: classId,
        ...(academicYear !== undefined && { academic_year: academicYear }),
      },
      orderBy: { academic_year: 'desc' },
      select: MENTOR_SELECT,
    });
  }

  /** DELETE /classes/:id/mentor/:academic_year (HoD only, own department). Hard delete. */
  async removeMentor(classId: number, academicYear: string, userId: number) {
    const hod = await this.resolveFacultyByUserId(userId);
    await this.assertClassInDepartment(classId, hod.department_id);

    try {
      await this.prisma.class_mentors.delete({
        where: {
          class_id_academic_year: {
            class_id: classId,
            academic_year: academicYear,
          },
        },
      });
    } catch (err: unknown) {
      if (prismaErrorCode(err) === 'P2025') {
        throw new NotFoundException({
          message:
            'No mentor assignment exists for this class in that academic year',
          errorCode: 'MENTOR_NOT_ASSIGNED',
        });
      }
      throw err;
    }

    this.logger.log(
      `Class mentor removed: class=${classId} year=${academicYear}`,
    );
    return { class_id: classId, academic_year: academicYear, removed: true };
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

  private async assertClassInDepartment(classId: number, departmentId: number) {
    const klass = await this.prisma.classes.findUnique({
      where: { id: classId },
    });
    if (!klass) {
      throw new NotFoundException({
        message: 'Class not found',
        errorCode: 'CLASS_NOT_FOUND',
      });
    }
    if (klass.department_id !== departmentId) {
      throw new ForbiddenException({
        message: 'You can only assign mentors within your own department',
        errorCode: 'DEPARTMENT_SCOPE_VIOLATION',
      });
    }
    return klass;
  }

  private async assertClassExists(classId: number) {
    const klass = await this.prisma.classes.findUnique({
      where: { id: classId },
    });
    if (!klass) {
      throw new NotFoundException({
        message: 'Class not found',
        errorCode: 'CLASS_NOT_FOUND',
      });
    }
    return klass;
  }

  private async assertFacultyExists(facultyId: number) {
    const faculty = await this.prisma.faculty.findUnique({
      where: { id: facultyId },
    });
    if (!faculty) {
      throw new NotFoundException({
        message: 'Faculty not found',
        errorCode: 'FACULTY_NOT_FOUND',
      });
    }
    return faculty;
  }
}
