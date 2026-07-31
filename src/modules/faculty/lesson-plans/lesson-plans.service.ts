import {
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { paginate } from 'src/common/dto/pagination.dto';
import { CreateLessonPlanDto } from './dto/create-lesson-plan.dto';
import { UpdateLessonPlanDto } from './dto/update-lesson-plan.dto';
import { ListLessonPlanQueryDto } from './dto/list-lesson-plan-query.dto';
import { UpsertLessonPlanDto } from './dto/upsert-lesson-plan.dto';

function prismaErrorCode(err: unknown): string | undefined {
  return typeof err === 'object' && err !== null && 'code' in err
    ? (err as { code?: string }).code
    : undefined;
}

const LESSON_PLAN_SELECT = {
  id: true,
  semester: true,
  content: true,
  updated_at: true,
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

interface LessonPlanRow {
  id: number;
  semester: number;
  content: string | null;
  updated_at: Date;
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

function toResponse(plan: LessonPlanRow) {
  return {
    id: plan.id,
    semester: plan.semester,
    content: plan.content,
    updated_at: plan.updated_at,
    class: {
      id: plan.classes.id,
      section: plan.classes.section,
      department: plan.classes.departments,
    },
    subject: plan.subjects,
    faculty: plan.faculty,
  };
}

@Injectable()
export class LessonPlansService {
  private readonly logger = new Logger(LessonPlansService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** POST /lesson-plans (Faculty only). */
  async create(dto: CreateLessonPlanDto, userId: number) {
    const faculty = await this.resolveFacultyByUserId(userId);

    await this.assertForeignKeysExist(dto.subject_id, dto.class_id);
    await this.assertFacultyMapped(
      faculty.id,
      dto.subject_id,
      dto.class_id,
      dto.academic_year,
    );

    const existing = await this.prisma.lesson_plans.findUnique({
      where: {
        faculty_id_subject_id_class_id_semester: {
          faculty_id: faculty.id,
          subject_id: dto.subject_id,
          class_id: dto.class_id,
          semester: dto.semester,
        },
      },
    });
    if (existing) {
      throw new ConflictException(
        'A lesson plan already exists for this faculty, subject, class and semester',
      );
    }

    let plan: LessonPlanRow;
    try {
      plan = await this.prisma.lesson_plans.create({
        data: {
          faculty_id: faculty.id,
          subject_id: dto.subject_id,
          class_id: dto.class_id,
          semester: dto.semester,
          content: dto.content,
        },
        select: LESSON_PLAN_SELECT,
      });
    } catch (err: unknown) {
      if (prismaErrorCode(err) === 'P2002') {
        throw new ConflictException(
          'A lesson plan already exists for this faculty, subject, class and semester',
        );
      }
      throw err;
    }

    this.logger.log(`Lesson plan created: id=${plan.id}`);
    return toResponse(plan);
  }

  /** GET /lesson-plans (Faculty/HoD/Student) — filtered, paginated. */
  async findAll(query: ListLessonPlanQueryDto) {
    const where = {
      faculty_id: query.faculty_id,
      class_id: query.class_id,
      subject_id: query.subject_id,
      semester: query.semester,
    };

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.lesson_plans.findMany({
        where,
        skip: query.skip,
        take: query.limit,
        orderBy: { id: 'asc' },
        select: LESSON_PLAN_SELECT,
      }),
      this.prisma.lesson_plans.count({ where }),
    ]);

    return paginate(rows.map(toResponse), total, query);
  }

  /** GET /lesson-plans/:id (Faculty/HoD/Student). */
  async findOne(id: number) {
    const plan = await this.prisma.lesson_plans.findUnique({
      where: { id },
      select: LESSON_PLAN_SELECT,
    });

    if (!plan) {
      throw new NotFoundException('Lesson plan not found');
    }

    return toResponse(plan);
  }

  /** PATCH /lesson-plans/:id (Faculty only — and only the faculty who owns it). */
  async update(id: number, dto: UpdateLessonPlanDto, userId: number) {
    const faculty = await this.resolveFacultyByUserId(userId);

    const existing = await this.prisma.lesson_plans.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Lesson plan not found');
    }

    if (existing.faculty_id !== faculty.id) {
      throw new ForbiddenException('You may only update lesson plans you own');
    }

    const plan = await this.prisma.lesson_plans.update({
      where: { id },
      data: {
        content: dto.content,
        // No @updatedAt directive on this column in schema.prisma — set it explicitly.
        updated_at: new Date(),
      },
      select: LESSON_PLAN_SELECT,
    });

    return toResponse(plan);
  }

  /**
   * DELETE /lesson-plans/:id (Faculty only — and only the faculty who owns it).
   * The schema has no soft-delete flag on this table, so this is a hard delete.
   */
  async remove(id: number, userId: number) {
    const faculty = await this.resolveFacultyByUserId(userId);

    const existing = await this.prisma.lesson_plans.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Lesson plan not found');
    }

    if (existing.faculty_id !== faculty.id) {
      throw new ForbiddenException('You may only delete lesson plans you own');
    }

    await this.prisma.lesson_plans.delete({ where: { id } });

    this.logger.log(`Lesson plan deleted: id=${id}`);
    return { id, deleted: true };
  }

  /**
   * PUT /me/lesson-plans (Faculty only).
   * A true upsert on the schema's real @@unique([faculty_id, subject_id,
   * class_id, semester]) — Prisma's .upsert() compiles this to a native
   * ON CONFLICT DO UPDATE, so there's no check-then-write race.
   */
  async upsertForFaculty(dto: UpsertLessonPlanDto, userId: number) {
    const faculty = await this.resolveFacultyByUserId(userId);

    await this.assertForeignKeysExist(dto.subject_id, dto.class_id);

    try {
      await this.assertFacultyMapped(faculty.id, dto.subject_id, dto.class_id);
    } catch (err: unknown) {
      // This endpoint's spec calls for 403 (not-mapped-to-teach) rather than
      // the 404 assertFacultyMapped throws for POST /lesson-plans — reusing
      // the same existence check, just translating the outcome for this route.
      if (err instanceof NotFoundException) {
        throw new ForbiddenException(
          'You are not assigned to teach this subject for this class',
        );
      }
      throw err;
    }

    const plan = await this.prisma.lesson_plans.upsert({
      where: {
        faculty_id_subject_id_class_id_semester: {
          faculty_id: faculty.id,
          subject_id: dto.subject_id,
          class_id: dto.class_id,
          semester: dto.semester,
        },
      },
      create: {
        faculty_id: faculty.id,
        subject_id: dto.subject_id,
        class_id: dto.class_id,
        semester: dto.semester,
        content: dto.content,
      },
      update: {
        content: dto.content,
        updated_at: new Date(),
      },
      select: LESSON_PLAN_SELECT,
    });

    this.logger.log(
      `Lesson plan upserted: id=${plan.id} faculty=${faculty.id}`,
    );
    return toResponse(plan);
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

  private async assertForeignKeysExist(subjectId: number, classId: number) {
    const [subject, klass] = await Promise.all([
      this.prisma.subjects.findUnique({ where: { id: subjectId } }),
      this.prisma.classes.findUnique({ where: { id: classId } }),
    ]);

    if (!subject) {
      throw new NotFoundException('Subject not found');
    }
    if (!klass) {
      throw new NotFoundException('Class not found');
    }
  }

  /**
   * workflow.md: a faculty must already be mapped (faculty_subject_class_mapping)
   * to a subject+class before a lesson plan can be created for it. There is no
   * faculty_mapping_id on lesson_plans, so this is checked directly. Scoped to
   * academic_year only when provided, since lesson_plans has nowhere to store it.
   */
  private async assertFacultyMapped(
    facultyId: number,
    subjectId: number,
    classId: number,
    academicYear?: string,
  ) {
    const mapping = await this.prisma.faculty_subject_class_mapping.findFirst({
      where: {
        faculty_id: facultyId,
        subject_id: subjectId,
        class_id: classId,
        ...(academicYear !== undefined && { academic_year: academicYear }),
      },
    });

    if (!mapping) {
      throw new NotFoundException(
        `No faculty_subject_class_mapping found for this faculty, subject and class${
          academicYear ? ` in academic year ${academicYear}` : ''
        }`,
      );
    }
  }
}
