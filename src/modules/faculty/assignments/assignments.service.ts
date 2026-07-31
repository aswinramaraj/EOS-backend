import {
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { paginate } from 'src/common/dto/pagination.dto';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { ListAssignmentQueryDto } from './dto/list-assignment-query.dto';

function prismaErrorCode(err: unknown): string | undefined {
  return typeof err === 'object' && err !== null && 'code' in err
    ? (err as { code?: string }).code
    : undefined;
}

const ASSIGNMENT_SELECT = {
  id: true,
  academic_year: true,
  semester: true,
  sequence_no: true,
  title: true,
  classes: { select: { id: true, section: true } },
  subjects: { select: { id: true, name: true, subject_code: true } },
} as const;

interface AssignmentRow {
  id: number;
  academic_year: string;
  semester: number;
  sequence_no: number;
  title: string | null;
  classes: { id: number; section: string };
  subjects: { id: number; name: string; subject_code: string };
}

function toResponse(row: AssignmentRow) {
  return {
    id: row.id,
    academic_year: row.academic_year,
    semester: row.semester,
    sequence_no: row.sequence_no,
    title: row.title,
    class: row.classes,
    subject: row.subjects,
  };
}

@Injectable()
export class AssignmentsService {
  private readonly logger = new Logger(AssignmentsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * POST /assignments (Faculty only).
   * The caller must be mapped (faculty_subject_class_mapping) to teach
   * subject_id for class_id in dto.academic_year — same ownership check
   * used before every other Faculty write in this codebase.
   */
  async create(dto: CreateAssignmentDto, userId: number) {
    const faculty = await this.resolveFacultyByUserId(userId);

    const klass = await this.prisma.classes.findUnique({
      where: { id: dto.class_id },
    });
    if (!klass) {
      throw new NotFoundException('Class not found');
    }

    const subject = await this.prisma.subjects.findUnique({
      where: { id: dto.subject_id },
    });
    if (!subject) {
      throw new NotFoundException('Subject not found');
    }

    const mapping = await this.prisma.faculty_subject_class_mapping.findFirst({
      where: {
        faculty_id: faculty.id,
        subject_id: dto.subject_id,
        class_id: dto.class_id,
        academic_year: dto.academic_year,
      },
    });
    if (!mapping) {
      throw new ForbiddenException(
        'You are not assigned to teach this subject for this class in the given academic year',
      );
    }

    try {
      const assignment = await this.prisma.assignments.create({
        data: {
          class_id: dto.class_id,
          subject_id: dto.subject_id,
          faculty_id: faculty.id,
          academic_year: dto.academic_year,
          semester: dto.semester,
          sequence_no: dto.sequence_no,
          title: dto.title,
        },
        select: ASSIGNMENT_SELECT,
      });

      this.logger.log(
        `Assignment created: id=${assignment.id} faculty=${faculty.id} class=${dto.class_id} subject=${dto.subject_id}`,
      );
      return toResponse(assignment);
    } catch (err: unknown) {
      if (prismaErrorCode(err) === 'P2002') {
        throw new ConflictException(
          'An assignment with this sequence number already exists for this class, subject, academic year, and semester',
        );
      }
      throw err;
    }
  }

  /** GET /assignments (Faculty only — own records). */
  async findAll(query: ListAssignmentQueryDto, userId: number) {
    const faculty = await this.resolveFacultyByUserId(userId);

    const where = {
      faculty_id: faculty.id,
      class_id: query.class_id,
      subject_id: query.subject_id,
      academic_year: query.academic_year,
      semester: query.semester,
    };

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.assignments.findMany({
        where,
        skip: query.skip,
        take: query.limit,
        orderBy: [{ id: 'desc' }],
        select: ASSIGNMENT_SELECT,
      }),
      this.prisma.assignments.count({ where }),
    ]);

    return paginate(rows.map(toResponse), total, query);
  }

  /** GET /assignments/:id (Faculty only — own record). */
  async findOne(id: number, userId: number) {
    const faculty = await this.resolveFacultyByUserId(userId);

    const assignment = await this.prisma.assignments.findUnique({
      where: { id },
      select: { ...ASSIGNMENT_SELECT, faculty_id: true },
    });
    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }
    if (assignment.faculty_id !== faculty.id) {
      throw new ForbiddenException('You may only view your own assignments');
    }

    return toResponse(assignment);
  }

  /** PATCH /assignments/:id (Faculty only — own record). Only `title` is editable. */
  async update(id: number, dto: UpdateAssignmentDto, userId: number) {
    const faculty = await this.resolveFacultyByUserId(userId);

    const existing = await this.prisma.assignments.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Assignment not found');
    }
    if (existing.faculty_id !== faculty.id) {
      throw new ForbiddenException('You may only edit your own assignments');
    }

    const assignment = await this.prisma.assignments.update({
      where: { id },
      data: { title: dto.title },
      select: ASSIGNMENT_SELECT,
    });

    return toResponse(assignment);
  }

  /**
   * DELETE /assignments/:id (Faculty only — own record).
   * student_assignment_status rows cascade on delete (schema:
   * onDelete: Cascade), so this also clears any submission ticks recorded
   * against this assignment.
   */
  async remove(id: number, userId: number) {
    const faculty = await this.resolveFacultyByUserId(userId);

    const existing = await this.prisma.assignments.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Assignment not found');
    }
    if (existing.faculty_id !== faculty.id) {
      throw new ForbiddenException('You may only delete your own assignments');
    }

    await this.prisma.assignments.delete({ where: { id } });

    this.logger.log(`Assignment deleted: id=${id}`);
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
