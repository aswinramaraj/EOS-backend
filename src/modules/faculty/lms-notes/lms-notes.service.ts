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
import { CreateLmsNoteDto } from './dto/create-lms-note.dto';
import { UpdateLmsNoteDto } from './dto/update-lms-note.dto';
import { ListLmsNoteQueryDto } from './dto/list-lms-note-query.dto';

function prismaErrorCode(err: unknown): string | undefined {
  return typeof err === 'object' && err !== null && 'code' in err
    ? (err as { code?: string }).code
    : undefined;
}

const LMS_NOTE_SELECT = {
  id: true,
  title: true,
  file_url: true,
  uploaded_at: true,
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

interface LmsNoteRow {
  id: number;
  title: string;
  file_url: string | null;
  uploaded_at: Date;
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

function toResponse(note: LmsNoteRow) {
  return {
    id: note.id,
    title: note.title,
    file_url: note.file_url,
    uploaded_at: note.uploaded_at,
    class: {
      id: note.classes.id,
      section: note.classes.section,
      department: note.classes.departments,
    },
    subject: note.subjects,
    faculty: note.faculty,
  };
}

@Injectable()
export class LmsNotesService {
  private readonly logger = new Logger(LmsNotesService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** POST /lms-notes (Faculty only). */
  async create(dto: CreateLmsNoteDto, userId: number) {
    const faculty = await this.resolveFacultyByUserId(userId);

    await this.assertForeignKeysExist(dto.subject_id, dto.class_id);
    await this.assertFacultyMapped(
      faculty.id,
      dto.subject_id,
      dto.class_id,
      dto.academic_year,
    );

    let note: LmsNoteRow;
    try {
      note = await this.prisma.lms_notes.create({
        data: {
          faculty_id: faculty.id,
          subject_id: dto.subject_id,
          class_id: dto.class_id,
          title: dto.title,
          file_url: dto.file_url,
        },
        select: LMS_NOTE_SELECT,
      });
    } catch (err: unknown) {
      if (prismaErrorCode(err) === 'P2002') {
        throw new ConflictException(
          'This LMS note conflicts with an existing record',
        );
      }
      throw err;
    }

    this.logger.log(`LMS note created: id=${note.id}`);
    return toResponse(note);
  }

  /** GET /lms-notes (Faculty/Student) — filtered, paginated. */
  async findAll(query: ListLmsNoteQueryDto) {
    const where = {
      faculty_id: query.faculty_id,
      class_id: query.class_id,
      subject_id: query.subject_id,
    };

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.lms_notes.findMany({
        where,
        skip: query.skip,
        take: query.limit,
        orderBy: { uploaded_at: 'desc' },
        select: LMS_NOTE_SELECT,
      }),
      this.prisma.lms_notes.count({ where }),
    ]);

    return paginate(rows.map(toResponse), total, query);
  }

  /** GET /lms-notes/:id (Faculty/Student). */
  async findOne(id: number) {
    const note = await this.prisma.lms_notes.findUnique({
      where: { id },
      select: LMS_NOTE_SELECT,
    });

    if (!note) {
      throw new NotFoundException('LMS note not found');
    }

    return toResponse(note);
  }

  /** PATCH /lms-notes/:id (Faculty only — and only the faculty who owns it). */
  async update(id: number, dto: UpdateLmsNoteDto, userId: number) {
    if (!dto || Object.keys(dto).length === 0) {
      throw new BadRequestException('No fields provided to update');
    }

    const faculty = await this.resolveFacultyByUserId(userId);

    const existing = await this.prisma.lms_notes.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('LMS note not found');
    }

    if (existing.faculty_id !== faculty.id) {
      throw new ForbiddenException('You may only update LMS notes you own');
    }

    const note = await this.prisma.lms_notes.update({
      where: { id },
      data: {
        title: dto.title,
        file_url: dto.file_url,
      },
      select: LMS_NOTE_SELECT,
    });

    return toResponse(note);
  }

  /**
   * DELETE /lms-notes/:id (Faculty only — and only the faculty who owns it).
   * The schema has no soft-delete flag on this table, so this is a hard delete.
   */
  async remove(id: number, userId: number) {
    const faculty = await this.resolveFacultyByUserId(userId);

    const existing = await this.prisma.lms_notes.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('LMS note not found');
    }

    if (existing.faculty_id !== faculty.id) {
      throw new ForbiddenException('You may only delete LMS notes you own');
    }

    await this.prisma.lms_notes.delete({ where: { id } });

    this.logger.log(`LMS note deleted: id=${id}`);
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
   * workflow.md: LMS notes are "created automatically when the faculty is
   * mapped to a subject of the respective class" — a faculty must already be
   * mapped (faculty_subject_class_mapping) to a subject+class before a note
   * can be created for it. There is no faculty_mapping_id on lms_notes, so
   * this is checked directly. Scoped to academic_year only when provided,
   * since lms_notes has nowhere to store it.
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
