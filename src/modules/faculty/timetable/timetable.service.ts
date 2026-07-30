import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { paginate } from 'src/common/dto/pagination.dto';
import { CreateTimetableDto } from './dto/create-timetable.dto';
import { UpdateTimetableDto } from './dto/update-timetable.dto';
import { ListTimetableQueryDto } from './dto/list-timetable-query.dto';
import { GetMyTimetableQueryDto } from './dto/get-my-timetable-query.dto';

function prismaErrorCode(err: unknown): string | undefined {
  return typeof err === 'object' && err !== null && 'code' in err
    ? (err as { code?: string }).code
    : undefined;
}

/**
 * Structural type covering both the main PrismaService and the `tx` client
 * Prisma hands into an interactive $transaction callback — the conflict
 * checks below run under either, depending on whether they're called inside
 * the advisory-lock-guarded transaction.
 */
type TimetableConflictClient = {
  timetable_slots: {
    findFirst: PrismaService['timetable_slots']['findFirst'];
  };
};

function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function timeStringToDate(time: string): Date {
  const normalized = time.length === 5 ? `${time}:00` : time;
  return new Date(`1970-01-01T${normalized}.000Z`);
}

const TIMETABLE_SELECT = {
  id: true,
  day_of_week: true,
  period_number: true,
  start_time: true,
  end_time: true,
  academic_year: true,
  semester: true,
  classes: {
    select: {
      id: true,
      section: true,
      departments: { select: { id: true, name: true, code: true } },
    },
  },
  subjects: { select: { id: true, name: true, subject_code: true } },
  faculty: {
    select: { id: true, first_name: true, last_name: true, designation: true },
  },
} as const;

interface TimetableRow {
  id: number;
  day_of_week: number;
  period_number: number;
  start_time: Date;
  end_time: Date;
  academic_year: string;
  semester: number;
  classes: {
    id: number;
    section: string;
    departments: { id: number; name: string; code: string };
  };
  subjects: { id: number; name: string; subject_code: string };
  faculty: {
    id: number;
    first_name: string;
    last_name: string;
    designation: string;
  };
}

const MY_TIMETABLE_SLOT_SELECT = {
  day_of_week: true,
  period_number: true,
  start_time: true,
  end_time: true,
  subjects: { select: { id: true, name: true, subject_code: true } },
  faculty: { select: { id: true, first_name: true, last_name: true } },
} as const;

interface MyTimetableSlotRow {
  day_of_week: number;
  period_number: number;
  start_time: Date;
  end_time: Date;
  subjects: { id: number; name: string; subject_code: string };
  faculty: { id: number; first_name: string; last_name: string };
}

function formatHHMM(time: Date): string {
  return time.toISOString().slice(11, 16);
}

function toMySlotResponse(slot: MyTimetableSlotRow) {
  return {
    period_number: slot.period_number,
    start_time: formatHHMM(slot.start_time),
    end_time: formatHHMM(slot.end_time),
    subject: slot.subjects,
    faculty: {
      id: slot.faculty.id,
      name: `${slot.faculty.first_name} ${slot.faculty.last_name}`,
    },
  };
}

const TODAY_SLOT_SELECT = {
  id: true,
  period_number: true,
  start_time: true,
  end_time: true,
  subject_id: true,
  class_id: true,
  subjects: { select: { name: true } },
  classes: {
    select: { section: true, departments: { select: { name: true } } },
  },
} as const;

interface TodaySlotRow {
  id: number;
  period_number: number;
  start_time: Date;
  end_time: Date;
  subject_id: number;
  class_id: number;
  subjects: { name: string };
  classes: { section: string; departments: { name: string } };
}

function toTodaySlotResponse(slot: TodaySlotRow) {
  return {
    id: slot.id,
    period_number: slot.period_number,
    start_time: formatHHMM(slot.start_time),
    end_time: formatHHMM(slot.end_time),
    subject_id: slot.subject_id,
    subject_name: slot.subjects.name,
    class_id: slot.class_id,
    class_section: slot.classes.section,
    department_name: slot.classes.departments.name,
  };
}

function toResponse(slot: TimetableRow) {
  return {
    id: slot.id,
    day_of_week: slot.day_of_week,
    period_number: slot.period_number,
    start_time: slot.start_time,
    end_time: slot.end_time,
    academic_year: slot.academic_year,
    semester: slot.semester,
    class: {
      id: slot.classes.id,
      section: slot.classes.section,
      department: slot.classes.departments,
    },
    subject: slot.subjects,
    faculty: slot.faculty,
  };
}

@Injectable()
export class TimetableService {
  private readonly logger = new Logger(TimetableService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** POST /timetable (HoD only). */
  async create(dto: CreateTimetableDto) {
    this.assertTimeOrder(dto.start_time, dto.end_time);

    await this.assertForeignKeysExist(
      dto.faculty_id,
      dto.subject_id,
      dto.class_id,
    );
    await this.assertFacultyMapped(
      dto.faculty_id,
      dto.subject_id,
      dto.class_id,
      dto.academic_year,
    );

    const slot = await this.prisma.$transaction(async (tx) => {
      // timetable_slots has no @@unique constraint at all, so nothing at the
      // DB level stops two concurrent requests from both passing the
      // conflict checks below and both inserting — a class double-booking,
      // a faculty double-booking, or both. An advisory lock scoped to this
      // exact (day_of_week, period_number, academic_year) scheduling slot
      // serializes every create/update touching it, so the second request's
      // own checks correctly see what the first one just committed.
      const lockKey = `timetable:${dto.day_of_week}:${dto.period_number}:${dto.academic_year}`;
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${lockKey}))`;

      await this.assertNoClassConflict(
        tx,
        dto.class_id,
        dto.day_of_week,
        dto.period_number,
        dto.academic_year,
        dto.semester,
      );
      await this.assertNoFacultyConflict(
        tx,
        dto.faculty_id,
        dto.day_of_week,
        dto.period_number,
        dto.academic_year,
      );

      return tx.timetable_slots.create({
        data: {
          class_id: dto.class_id,
          subject_id: dto.subject_id,
          faculty_id: dto.faculty_id,
          day_of_week: dto.day_of_week,
          period_number: dto.period_number,
          start_time: timeStringToDate(dto.start_time),
          end_time: timeStringToDate(dto.end_time),
          academic_year: dto.academic_year,
          semester: dto.semester,
        },
        select: TIMETABLE_SELECT,
      });
    });

    this.logger.log(`Timetable slot created: id=${slot.id}`);
    return toResponse(slot);
  }

  /** GET /timetable (Admin/HoD/Faculty/Student) — filtered, paginated. */
  async findAll(query: ListTimetableQueryDto) {
    const where = {
      class_id: query.class_id,
      faculty_id: query.faculty_id,
      subject_id: query.subject_id,
      semester: query.semester,
      academic_year: query.academic_year,
      day_of_week: query.day_of_week,
    };

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.timetable_slots.findMany({
        where,
        skip: query.skip,
        take: query.limit,
        orderBy: [{ day_of_week: 'asc' }, { period_number: 'asc' }],
        select: TIMETABLE_SELECT,
      }),
      this.prisma.timetable_slots.count({ where }),
    ]);

    return paginate(rows.map(toResponse), total, query);
  }

  /** GET /timetable/:id (Admin/HoD/Faculty/Student). */
  async findOne(id: number) {
    const slot = await this.prisma.timetable_slots.findUnique({
      where: { id },
      select: TIMETABLE_SELECT,
    });

    if (!slot) {
      throw new NotFoundException('Timetable entry not found');
    }

    return toResponse(slot);
  }

  /** PATCH /timetable/:id (HoD only). */
  async update(id: number, dto: UpdateTimetableDto) {
    if (!dto || Object.keys(dto).length === 0) {
      throw new BadRequestException('No fields provided to update');
    }

    const existing = await this.prisma.timetable_slots.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Timetable entry not found');
    }

    const effective = {
      class_id: dto.class_id ?? existing.class_id,
      subject_id: dto.subject_id ?? existing.subject_id,
      faculty_id: dto.faculty_id ?? existing.faculty_id,
      day_of_week: dto.day_of_week ?? existing.day_of_week,
      period_number: dto.period_number ?? existing.period_number,
      academic_year: dto.academic_year ?? existing.academic_year,
      semester: dto.semester ?? existing.semester,
    };

    const startTime =
      dto.start_time ?? this.dateToTimeString(existing.start_time);
    const endTime = dto.end_time ?? this.dateToTimeString(existing.end_time);
    this.assertTimeOrder(startTime, endTime);

    await this.assertForeignKeysExist(
      effective.faculty_id,
      effective.subject_id,
      effective.class_id,
    );
    await this.assertFacultyMapped(
      effective.faculty_id,
      effective.subject_id,
      effective.class_id,
      effective.academic_year,
    );

    try {
      const slot = await this.prisma.$transaction(async (tx) => {
        // Same race as create() — see there for why this lock exists.
        // Scoped to the EFFECTIVE (post-merge) slot only: the row being
        // vacated (if day/period/year is changing) doesn't need protection,
        // since this same update is what's vacating it.
        const lockKey = `timetable:${effective.day_of_week}:${effective.period_number}:${effective.academic_year}`;
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${lockKey}))`;

        await this.assertNoClassConflict(
          tx,
          effective.class_id,
          effective.day_of_week,
          effective.period_number,
          effective.academic_year,
          effective.semester,
          id,
        );
        await this.assertNoFacultyConflict(
          tx,
          effective.faculty_id,
          effective.day_of_week,
          effective.period_number,
          effective.academic_year,
          id,
        );

        return tx.timetable_slots.update({
          where: { id },
          data: {
            ...effective,
            start_time: timeStringToDate(startTime),
            end_time: timeStringToDate(endTime),
          },
          select: TIMETABLE_SELECT,
        });
      });

      return toResponse(slot);
    } catch (err: unknown) {
      if (prismaErrorCode(err) === 'P2025') {
        throw new NotFoundException('Timetable entry not found');
      }
      throw err;
    }
  }

  /**
   * GET /me/timetable (Student only).
   *
   * Resolves the caller's own class_id from the JWT — never client-supplied,
   * so a student cannot request another student's or another class's
   * timetable. Scoped to the class's current_semester when set (classes has
   * no separate "current academic_year" column, so academic_year is not
   * filtered here — every academic_year's rows for that semester/class are
   * returned, since the schema has no flag marking which year is "current").
   * `query.week` is accepted but unused — see GetMyTimetableQueryDto.
   */
  async findForStudent(userId: number, query: GetMyTimetableQueryDto) {
    const student = await this.prisma.students.findUnique({
      where: { user_id: userId },
    });
    if (!student) {
      throw new NotFoundException(
        'Student profile not found for the authenticated user',
      );
    }
    if (student.class_id === null) {
      throw new UnprocessableEntityException({
        message: 'You have not been assigned to a class yet',
        errorCode: 'CLASS_NOT_ASSIGNED',
      });
    }

    const klass = await this.prisma.classes.findUnique({
      where: { id: student.class_id },
    });

    const rows = await this.prisma.timetable_slots.findMany({
      where: {
        class_id: student.class_id,
        ...(klass?.current_semester != null && {
          semester: klass.current_semester,
        }),
        ...(query.day !== undefined && { day_of_week: query.day }),
      },
      orderBy: [{ day_of_week: 'asc' }, { period_number: 'asc' }],
      select: MY_TIMETABLE_SLOT_SELECT,
    });

    if (query.day !== undefined) {
      return {
        day_of_week: query.day,
        slots: rows.map(toMySlotResponse),
      };
    }

    const days = new Map<number, ReturnType<typeof toMySlotResponse>[]>();
    for (const row of rows) {
      const daySlots = days.get(row.day_of_week) ?? [];
      daySlots.push(toMySlotResponse(row));
      days.set(row.day_of_week, daySlots);
    }

    return {
      days: Array.from(days.entries()).map(([day_of_week, slots]) => ({
        day_of_week,
        slots,
      })),
    };
  }

  /**
   * GET /me/classes/today (Faculty only).
   *
   * Resolves the caller's own faculty_id from the JWT — never client-supplied.
   * "Today" is resolved server-side via JS Date.getDay() (0=Sunday..6=Saturday),
   * which lines up with this module's day_of_week convention (1=Monday..6=
   * Saturday) for every value that convention actually stores — a Sunday (0)
   * simply matches no rows, since no timetable_slots row can have
   * day_of_week 0. Not scoped to academic_year/semester — the doc doesn't
   * specify how "currently active" is resolved for a class the caller
   * teaches (unlike the student view, which has classes.current_semester to
   * anchor on), so every matching row for today is returned regardless of year.
   */
  async findTodayForFaculty(userId: number) {
    const faculty = await this.resolveFacultyByUserId(userId);
    const dayOfWeek = new Date().getDay();

    const rows = await this.prisma.timetable_slots.findMany({
      where: { faculty_id: faculty.id, day_of_week: dayOfWeek },
      orderBy: { period_number: 'asc' },
      select: TODAY_SLOT_SELECT,
    });

    return rows.map(toTodaySlotResponse);
  }

  /**
   * DELETE /timetable/:id (HoD only).
   * The schema has no soft-delete flag on this table, so this is a hard delete.
   */
  async remove(id: number) {
    try {
      await this.prisma.timetable_slots.delete({ where: { id } });
    } catch (err: unknown) {
      if (prismaErrorCode(err) === 'P2025') {
        throw new NotFoundException('Timetable entry not found');
      }
      throw err;
    }

    this.logger.log(`Timetable slot deleted: id=${id}`);
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

  private dateToTimeString(time: Date): string {
    return time.toISOString().slice(11, 19);
  }

  private assertTimeOrder(startTime: string, endTime: string) {
    if (parseTimeToMinutes(endTime) <= parseTimeToMinutes(startTime)) {
      throw new BadRequestException('end_time must be after start_time');
    }
  }

  private async assertForeignKeysExist(
    facultyId: number,
    subjectId: number,
    classId: number,
  ) {
    const [faculty, subject, klass] = await Promise.all([
      this.prisma.faculty.findUnique({ where: { id: facultyId } }),
      this.prisma.subjects.findUnique({ where: { id: subjectId } }),
      this.prisma.classes.findUnique({ where: { id: classId } }),
    ]);

    if (!faculty) {
      throw new NotFoundException('Faculty not found');
    }
    if (!subject) {
      throw new NotFoundException('Subject not found');
    }
    if (!klass) {
      throw new NotFoundException('Class not found');
    }
  }

  /**
   * workflow.md: "HoD ... maps the faculty to the class who was assigned to
   * the subject" — a faculty must already be mapped (faculty_subject_class_mapping)
   * to a subject+class for a given academic_year before they can be scheduled.
   */
  private async assertFacultyMapped(
    facultyId: number,
    subjectId: number,
    classId: number,
    academicYear: string,
  ) {
    const mapping = await this.prisma.faculty_subject_class_mapping.findFirst({
      where: {
        faculty_id: facultyId,
        subject_id: subjectId,
        class_id: classId,
        academic_year: academicYear,
      },
    });

    if (!mapping) {
      throw new BadRequestException(
        'Faculty is not mapped to this subject and class for the given academic year',
      );
    }
  }

  /**
   * timetable_slots has NO @@unique constraint at all — this is an
   * application-level rule: a class cannot have two different subjects/faculty
   * in the same period on the same day within the same academic year+semester.
   * `client` is either the main PrismaService or the `tx` from the
   * advisory-lock-guarded transaction in create()/update() — see there for why.
   */
  private async assertNoClassConflict(
    client: TimetableConflictClient,
    classId: number,
    dayOfWeek: number,
    periodNumber: number,
    academicYear: string,
    semester: number,
    excludeId?: number,
  ) {
    const conflict = await client.timetable_slots.findFirst({
      where: {
        class_id: classId,
        day_of_week: dayOfWeek,
        period_number: periodNumber,
        academic_year: academicYear,
        semester,
        ...(excludeId !== undefined && { id: { not: excludeId } }),
      },
    });

    if (conflict) {
      throw new ConflictException(
        `Class already has a timetable entry for day ${dayOfWeek}, period ${periodNumber} (${academicYear}, semester ${semester})`,
      );
    }
  }

  /**
   * Not explicitly requested, but a faculty cannot teach two classes in the
   * same period — this prevents that impossible schedule.
   *
   * Deliberately NOT scoped by semester, unlike assertNoClassConflict: a
   * faculty is one physical person, and workflow.md itself says they "can be
   * assigned to multiple class of different batches" — which routinely means
   * different semester numbers within the same academic_year (e.g. teaching
   * a semester-7 class and a semester-3 class simultaneously). Filtering this
   * check by semester would let those two rows coexist even when they land
   * on the exact same day+period, producing an impossible schedule for that
   * one faculty. class_id conflicts don't have this problem since class_id
   * alone already pins one specific class.
   */
  private async assertNoFacultyConflict(
    client: TimetableConflictClient,
    facultyId: number,
    dayOfWeek: number,
    periodNumber: number,
    academicYear: string,
    excludeId?: number,
  ) {
    const conflict = await client.timetable_slots.findFirst({
      where: {
        faculty_id: facultyId,
        day_of_week: dayOfWeek,
        period_number: periodNumber,
        academic_year: academicYear,
        ...(excludeId !== undefined && { id: { not: excludeId } }),
      },
    });

    if (conflict) {
      throw new ConflictException(
        `Faculty already has another class scheduled for day ${dayOfWeek}, period ${periodNumber} (${academicYear})`,
      );
    }
  }
}
