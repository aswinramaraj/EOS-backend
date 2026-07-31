import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateLeaveDto } from './dto/create-leave.dto';

function toDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function startOfToday(): Date {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
}

@Injectable()
export class MeLeavesService {
  private readonly logger = new Logger(MeLeavesService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * POST /me/leaves
   *
   * Self-scoped: student_id resolved from the JWT, never accepted from the
   * request. Always starts the two-stage approval chain at status='pending'
   * with both approval columns null — this endpoint does not check whether
   * a mentor is assigned yet (a soft dependency per the spec's own note),
   * and does not check for overlapping requests (no constraint in the
   * schema, explicitly deferred by the spec).
   *
   * Error cases:
   *  404 STUDENT_NOT_FOUND   – authenticated user has no linked student
   *                            record (same defensive consistency check as
   *                            the sibling /me/* endpoints; spec marks this
   *                            "not applicable" but it never fires for a
   *                            real, correctly-provisioned student account)
   *  422 INVALID_DATE_RANGE  – from_date in the past, or from_date > to_date
   *  500 INTERNAL_ERROR      – unexpected DB failure
   */
  async createLeave(userId: number, dto: CreateLeaveDto) {
    const fromDate = new Date(dto.from_date);
    const toDate = new Date(dto.to_date);

    if (fromDate < startOfToday() || fromDate > toDate) {
      throw new UnprocessableEntityException({
        message:
          'from_date must not be in the past and must be on or before to_date',
        errorCode: 'INVALID_DATE_RANGE',
      });
    }

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

    const leave = await this.insertLeave(
      userId,
      student.id,
      dto,
      fromDate,
      toDate,
    );

    return {
      id: leave.id,
      student_id: leave.student_id,
      from_date: toDateOnly(leave.from_date),
      to_date: toDateOnly(leave.to_date),
      reason: leave.reason,
      status: leave.status,
      approved_by_faculty_id: leave.approved_by_faculty_id,
      approved_by_hod_user_id: leave.approved_by_hod_user_id,
    };
  }

  private async insertLeave(
    userId: number,
    studentId: number,
    dto: CreateLeaveDto,
    fromDate: Date,
    toDate: Date,
  ) {
    try {
      return await this.prisma.student_leaves.create({
        data: {
          student_id: studentId,
          from_date: fromDate,
          to_date: toDate,
          reason: dto.reason,
          status: 'pending',
        },
      });
    } catch (err) {
      this.logger.error(
        `Failed to create leave request for user ${userId}`,
        err,
      );
      throw new InternalServerErrorException({
        message: 'Something went wrong. Please try again.',
        errorCode: 'INTERNAL_ERROR',
      });
    }
  }
}
