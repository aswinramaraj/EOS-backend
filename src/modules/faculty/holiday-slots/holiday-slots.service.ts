import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { paginate } from 'src/common/dto/pagination.dto';
import { CreateHolidaySlotDto } from './dto/create-holiday-slot.dto';
import { UpdateHolidaySlotDto } from './dto/update-holiday-slot.dto';
import { ListHolidaySlotQueryDto } from './dto/list-holiday-slot-query.dto';
import { CreateHolidayMappingDto } from './dto/create-holiday-mapping.dto';
import { ListHolidayMappingQueryDto } from './dto/list-holiday-mapping-query.dto';

function prismaErrorCode(err: unknown): string | undefined {
  return typeof err === 'object' && err !== null && 'code' in err
    ? (err as { code?: string }).code
    : undefined;
}

const HOLIDAY_SLOT_SELECT = {
  id: true,
  name: true,
  from_date: true,
  to_date: true,
} as const;

const HOLIDAY_MAPPING_SELECT = {
  id: true,
  holiday_slots: { select: HOLIDAY_SLOT_SELECT },
} as const;

const HOLIDAY_MAPPING_WITH_FACULTY_SELECT = {
  id: true,
  holiday_slots: { select: HOLIDAY_SLOT_SELECT },
  faculty: {
    select: { id: true, first_name: true, last_name: true, designation: true },
  },
} as const;

interface HolidaySlotRow {
  id: number;
  name: string;
  from_date: Date;
  to_date: Date;
}

interface HolidayMappingRow {
  id: number;
  holiday_slots: HolidaySlotRow;
}

interface HolidayMappingWithFacultyRow extends HolidayMappingRow {
  faculty: {
    id: number;
    first_name: string;
    last_name: string;
    designation: string;
  };
}

function toSlotResponse(row: HolidaySlotRow) {
  return {
    id: row.id,
    name: row.name,
    from_date: row.from_date,
    to_date: row.to_date,
  };
}

function toMappingResponse(row: HolidayMappingRow) {
  return {
    id: row.id,
    holiday_slot: toSlotResponse(row.holiday_slots),
  };
}

function toMappingWithFacultyResponse(row: HolidayMappingWithFacultyRow) {
  return {
    id: row.id,
    holiday_slot: toSlotResponse(row.holiday_slots),
    faculty: row.faculty,
  };
}

@Injectable()
export class HolidaySlotsService {
  private readonly logger = new Logger(HolidaySlotsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** POST /holiday-slots (HR Payroll only). */
  async createSlot(dto: CreateHolidaySlotDto) {
    const fromDate = new Date(dto.from_date);
    const toDate = new Date(dto.to_date);
    if (toDate < fromDate) {
      throw new BadRequestException('to_date must be on or after from_date');
    }

    const slot = await this.prisma.holiday_slots.create({
      data: { name: dto.name, from_date: fromDate, to_date: toDate },
      select: HOLIDAY_SLOT_SELECT,
    });

    this.logger.log(`Holiday slot created: id=${slot.id} name=${dto.name}`);
    return toSlotResponse(slot);
  }

  /** GET /holiday-slots (HR Payroll / Faculty — same shared catalog view). */
  async findAllSlots(query: ListHolidaySlotQueryDto) {
    const where: Record<string, unknown> = {
      name: query.name,
    };

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.holiday_slots.findMany({
        where,
        skip: query.skip,
        take: query.limit,
        orderBy: { from_date: 'desc' },
        select: HOLIDAY_SLOT_SELECT,
      }),
      this.prisma.holiday_slots.count({ where }),
    ]);

    return paginate(rows.map(toSlotResponse), total, query);
  }

  /** GET /holiday-slots/:id (HR Payroll / Faculty). */
  async findOneSlot(id: number) {
    const slot = await this.prisma.holiday_slots.findUnique({
      where: { id },
      select: HOLIDAY_SLOT_SELECT,
    });
    if (!slot) {
      throw new NotFoundException('Holiday slot not found');
    }
    return toSlotResponse(slot);
  }

  /** PATCH /holiday-slots/:id (HR Payroll only). */
  async updateSlot(id: number, dto: UpdateHolidaySlotDto) {
    if (!dto || Object.keys(dto).length === 0) {
      throw new BadRequestException('No fields provided to update');
    }

    const existing = await this.prisma.holiday_slots.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Holiday slot not found');
    }

    const fromDate = dto.from_date
      ? new Date(dto.from_date)
      : existing.from_date;
    const toDate = dto.to_date ? new Date(dto.to_date) : existing.to_date;
    if (toDate < fromDate) {
      throw new BadRequestException('to_date must be on or after from_date');
    }

    const slot = await this.prisma.holiday_slots.update({
      where: { id },
      data: {
        name: dto.name,
        from_date: dto.from_date ? fromDate : undefined,
        to_date: dto.to_date ? toDate : undefined,
      },
      select: HOLIDAY_SLOT_SELECT,
    });

    return toSlotResponse(slot);
  }

  /**
   * DELETE /holiday-slots/:id (HR Payroll only).
   * faculty_holiday_mapping.holiday_slot_id is onDelete: NoAction, so a slot
   * already picked by faculty can't be hard-deleted — surfaced as 409
   * instead of leaking the raw FK-violation error.
   */
  async removeSlot(id: number) {
    try {
      await this.prisma.holiday_slots.delete({ where: { id } });
    } catch (err: unknown) {
      const code = prismaErrorCode(err);
      if (code === 'P2025') {
        throw new NotFoundException('Holiday slot not found');
      }
      if (code === 'P2003') {
        throw new ConflictException(
          'This slot has already been selected by faculty and cannot be deleted',
        );
      }
      throw err;
    }

    this.logger.log(`Holiday slot deleted: id=${id}`);
    return { id, deleted: true };
  }

  /**
   * POST me/holiday-mapping (Faculty only).
   * A faculty may hold selections across multiple slots — only picking the
   * SAME slot twice is blocked (schema's @@unique([faculty_id, holiday_slot_id])).
   */
  async createMapping(dto: CreateHolidayMappingDto, userId: number) {
    const faculty = await this.resolveFacultyByUserId(userId);

    const slot = await this.prisma.holiday_slots.findUnique({
      where: { id: dto.holiday_slot_id },
    });
    if (!slot) {
      throw new NotFoundException('Holiday slot not found');
    }

    try {
      const mapping = await this.prisma.faculty_holiday_mapping.create({
        data: { faculty_id: faculty.id, holiday_slot_id: dto.holiday_slot_id },
        select: HOLIDAY_MAPPING_SELECT,
      });

      this.logger.log(
        `Holiday slot selected: faculty=${faculty.id} slot=${dto.holiday_slot_id}`,
      );
      return toMappingResponse(mapping);
    } catch (err: unknown) {
      if (prismaErrorCode(err) === 'P2002') {
        throw new ConflictException('You have already selected this slot');
      }
      throw err;
    }
  }

  /** GET me/holiday-mapping (Faculty only — own selections). */
  async findMyMappings(userId: number) {
    const faculty = await this.resolveFacultyByUserId(userId);

    const rows = await this.prisma.faculty_holiday_mapping.findMany({
      where: { faculty_id: faculty.id },
      orderBy: { id: 'desc' },
      select: HOLIDAY_MAPPING_SELECT,
    });

    return rows.map(toMappingResponse);
  }

  /** DELETE me/holiday-mapping/:id (Faculty only — own selection). */
  async removeMyMapping(id: number, userId: number) {
    const faculty = await this.resolveFacultyByUserId(userId);

    const existing = await this.prisma.faculty_holiday_mapping.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Holiday slot selection not found');
    }
    if (existing.faculty_id !== faculty.id) {
      throw new ForbiddenException(
        'You may only withdraw your own holiday slot selections',
      );
    }

    await this.prisma.faculty_holiday_mapping.delete({ where: { id } });

    this.logger.log(`Holiday slot selection removed: id=${id}`);
    return { id, deleted: true };
  }

  /** GET holiday-mapping (HR Payroll only — every faculty's selections). */
  async findAllMappings(query: ListHolidayMappingQueryDto) {
    const where: Record<string, unknown> = {
      faculty_id: query.faculty_id,
      holiday_slot_id: query.holiday_slot_id,
    };

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.faculty_holiday_mapping.findMany({
        where,
        skip: query.skip,
        take: query.limit,
        orderBy: { id: 'desc' },
        select: HOLIDAY_MAPPING_WITH_FACULTY_SELECT,
      }),
      this.prisma.faculty_holiday_mapping.count({ where }),
    ]);

    return paginate(rows.map(toMappingWithFacultyResponse), total, query);
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
