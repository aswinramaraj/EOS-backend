import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { GetProjectsDto } from './dto/get-projects.dto';

function toMentorName(
  faculty: { first_name: string; last_name: string } | null,
): string | null {
  return faculty ? `${faculty.first_name} ${faculty.last_name}` : null;
}

@Injectable()
export class MeProjectsService {
  private readonly logger = new Logger(MeProjectsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * POST /me/projects
   *
   * Self-scoped: student_id resolved from the JWT, never accepted from the
   * request.
   *
   * Response includes `mentor_faculty_name` — an addition beyond the
   * spec's example response (which only shows a bare `mentor_faculty_id`).
   * Unlike the users.email substitutions needed elsewhere (HOD/warden
   * display names), `faculty` genuinely has `first_name`/`last_name`
   * columns, so this is a real name, resolved via the same existence
   * check already required for `mentor_faculty_id` — costs nothing extra.
   *
   * Error cases:
   *  404 STUDENT_NOT_FOUND – authenticated user has no linked student
   *                          record (spec doesn't list this code, kept
   *                          for consistency with every sibling /me/*
   *                          endpoint)
   *  404 FACULTY_NOT_FOUND – mentor_faculty_id provided but doesn't
   *                          reference an existing faculty row
   *  500 INTERNAL_ERROR    – unexpected DB failure
   */
  async createProject(userId: number, dto: CreateProjectDto) {
    const student = await this.prisma.students.findUnique({
      where: { user_id: userId },
      select: { id: true },
    });
    if (!student) {
      throw new NotFoundException({
        message: 'Student profile not found for this account',
        errorCode: 'STUDENT_NOT_FOUND',
      });
    }

    let mentor: { first_name: string; last_name: string } | null = null;
    if (dto.mentor_faculty_id !== undefined) {
      mentor = await this.fetchMentor(userId, dto.mentor_faculty_id);
      if (!mentor) {
        throw new NotFoundException({
          message: 'Mentor faculty not found',
          errorCode: 'FACULTY_NOT_FOUND',
        });
      }
    }

    const project = await this.insertProject(userId, student.id, dto);

    return {
      id: project.id,
      title: project.title,
      description: project.description,
      mentor_faculty_id: project.mentor_faculty_id,
      mentor_faculty_name: toMentorName(mentor),
    };
  }

  /**
   * GET /me/projects?page=&page_size=
   *
   * Self-scoped: student_id resolved from the JWT. No status filter — see
   * todo.md/19-GET-me-projects.md (self-authored) for why: student_projects
   * has no status/workflow column at all.
   *
   * Sorted by `id DESC`, not `created_at DESC` like every sibling list
   * endpoint — student_projects has no timestamp column (confirmed via
   * schema.prisma), so the auto-increment id is the only available proxy
   * for insertion order.
   *
   * Error cases:
   *  404 STUDENT_NOT_FOUND – authenticated user has no linked student
   *                          record (not in the self-authored spec's error
   *                          table, kept for consistency with every
   *                          sibling /me/* endpoint)
   *  500 INTERNAL_ERROR    – unexpected DB failure
   */
  async getMyProjects(userId: number, dto: GetProjectsDto) {
    const student = await this.prisma.students.findUnique({
      where: { user_id: userId },
      select: { id: true },
    });
    if (!student) {
      throw new NotFoundException({
        message: 'Student profile not found for this account',
        errorCode: 'STUDENT_NOT_FOUND',
      });
    }

    const page = dto.page ?? 1;
    const pageSize = dto.page_size ?? 20;

    const [total, rows] = await this.fetchProjects(
      userId,
      student.id,
      page,
      pageSize,
    );

    return {
      data: rows.map((row) => ({
        id: row.id,
        title: row.title,
        description: row.description,
        mentor_faculty_id: row.mentor_faculty_id,
        mentor_faculty_name: toMentorName(row.faculty),
      })),
      page,
      page_size: pageSize,
      total,
    };
  }

  private async fetchProjects(
    userId: number,
    studentId: number,
    page: number,
    pageSize: number,
  ) {
    const where = { student_id: studentId };

    try {
      return await Promise.all([
        this.prisma.student_projects.count({ where }),
        this.prisma.student_projects.findMany({
          where,
          select: {
            id: true,
            title: true,
            description: true,
            mentor_faculty_id: true,
            faculty: { select: { first_name: true, last_name: true } },
          },
          orderBy: { id: 'desc' },
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
      ]);
    } catch (err) {
      this.logger.error(`Failed to fetch projects for user ${userId}`, err);
      throw new InternalServerErrorException({
        message: 'Something went wrong. Please try again.',
        errorCode: 'INTERNAL_ERROR',
      });
    }
  }

  private async fetchMentor(userId: number, facultyId: number) {
    try {
      return await this.prisma.faculty.findUnique({
        where: { id: facultyId },
        select: { first_name: true, last_name: true },
      });
    } catch (err) {
      this.logger.error(
        `Failed to look up mentor faculty ${facultyId} for user ${userId}`,
        err,
      );
      throw new InternalServerErrorException({
        message: 'Something went wrong. Please try again.',
        errorCode: 'INTERNAL_ERROR',
      });
    }
  }

  private async insertProject(
    userId: number,
    studentId: number,
    dto: CreateProjectDto,
  ) {
    try {
      return await this.prisma.student_projects.create({
        data: {
          student_id: studentId,
          title: dto.title,
          description: dto.description,
          mentor_faculty_id: dto.mentor_faculty_id,
        },
      });
    } catch (err) {
      this.logger.error(`Failed to create project for user ${userId}`, err);
      throw new InternalServerErrorException({
        message: 'Something went wrong. Please try again.',
        errorCode: 'INTERNAL_ERROR',
      });
    }
  }
}
