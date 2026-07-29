import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateHostelOutingDto } from './dto/create-hostel-outing.dto';

function startOfToday(): Date {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
}

function toDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function toTimeOnly(date: Date): string {
  return date.toISOString().slice(11, 16);
}

function toTimeDate(time: string): Date {
  return new Date(`1970-01-01T${time}:00.000Z`);
}

@Injectable()
export class MeHostelOutingsService {
  private readonly logger = new Logger(MeHostelOutingsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * POST /me/hostel-outings
   *
   * Self-scoped: student_id resolved from the JWT, never accepted from the
   * request.
   *
   * The hosteller check (§3 step 5 / §5's documented 422 NOT_A_HOSTELLER)
   * is implemented, not left as an open question — despite being annotated
   * "Pending from Backend Implementation" in the workflow, the Error
   * Responses section fully specifies the exact errorCode/message, which
   * reads as "not yet built and confirmed in practice" rather than
   * "undecided whether to build." The schema itself has no FK tying
   * hostel_outings to student_hostel_mapping (confirmed: no such
   * constraint on hostel_outings.student_id), so this check is purely an
   * application-layer gate, matching the spec's own framing.
   *
   * Response includes `room_number` — an addition beyond the spec's
   * example response (which shows no hostel/room context at all). The
   * hosteller check already has to read student_hostel_mapping joined to
   * hostel_rooms, so surfacing which room this outing request pertains to
   * costs nothing extra, rather than leaving the client to look it up
   * separately.
   *
   * start_time/return_time are stored as Postgres TIME columns
   * (`@db.Time(6)`); Prisma/pg represent these as JS Date objects with an
   * arbitrary date portion, so HH:MM strings are converted to/from a fixed
   * 1970-01-01 reference date on the way in and out.
   *
   * Same-day return-before-departure check (found during a recheck, not in
   * the spec's own Validation Rules): confirmed live that a same-day outing
   * with return_time earlier than start_time (e.g. depart 18:00, "return"
   * 09:00 the same date) was silently accepted, implying a negative
   * duration. For a multi-day outing (from_date < to_date), return_time's
   * clock reading legitimately can be "earlier" than start_time's — the
   * return happens on a later date regardless of the HH:MM portion — so
   * this check only applies when from_date === to_date. Reuses the
   * INVALID_DATE_RANGE errorCode (this is still fundamentally a date/time
   * ordering problem) with a message specific to this case.
   *
   * Error cases:
   *  404 STUDENT_NOT_FOUND  – authenticated user has no linked student
   *                           record (spec doesn't list this code, kept
   *                           for consistency with every sibling /me/*
   *                           endpoint)
   *  422 INVALID_DATE_RANGE – from_date in the past, from_date > to_date,
   *                           or (same-day outing) return_time < start_time
   *  422 NOT_A_HOSTELLER    – caller has no student_hostel_mapping row
   *  500 INTERNAL_ERROR     – unexpected DB failure
   */
  async createHostelOuting(userId: number, dto: CreateHostelOutingDto) {
    const fromDate = new Date(dto.from_date);
    const toDate = new Date(dto.to_date);
    if (fromDate < startOfToday() || fromDate > toDate) {
      throw new UnprocessableEntityException({
        message:
          'from_date must not be in the past and must be on or before to_date',
        errorCode: 'INVALID_DATE_RANGE',
      });
    }
    if (
      dto.return_time &&
      dto.from_date === dto.to_date &&
      dto.return_time < dto.start_time
    ) {
      throw new UnprocessableEntityException({
        message:
          'return_time must not be before start_time for a same-day outing',
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

    const hostelMapping = await this.prisma.student_hostel_mapping.findUnique({
      where: { student_id: student.id },
      select: { hostel_rooms: { select: { room_number: true } } },
    });
    if (!hostelMapping) {
      throw new UnprocessableEntityException({
        message: 'Only hostellers can request outings',
        errorCode: 'NOT_A_HOSTELLER',
      });
    }

    const outing = await this.insertOuting(
      userId,
      student.id,
      dto,
      fromDate,
      toDate,
    );

    return {
      id: outing.id,
      from_date: toDateOnly(outing.from_date),
      to_date: toDateOnly(outing.to_date),
      start_time: toTimeOnly(outing.start_time),
      return_time: outing.return_time ? toTimeOnly(outing.return_time) : null,
      reason: outing.reason,
      status: outing.status,
      room_number: hostelMapping.hostel_rooms.room_number,
    };
  }

  private async insertOuting(
    userId: number,
    studentId: number,
    dto: CreateHostelOutingDto,
    fromDate: Date,
    toDate: Date,
  ) {
    try {
      return await this.prisma.hostel_outings.create({
        data: {
          student_id: studentId,
          from_date: fromDate,
          to_date: toDate,
          start_time: toTimeDate(dto.start_time),
          return_time: dto.return_time ? toTimeDate(dto.return_time) : null,
          reason: dto.reason,
          status: 'pending',
        },
      });
    } catch (err) {
      this.logger.error(
        `Failed to create hostel outing request for user ${userId}`,
        err,
      );
      throw new InternalServerErrorException({
        message: 'Something went wrong. Please try again.',
        errorCode: 'INTERNAL_ERROR',
      });
    }
  }
}
