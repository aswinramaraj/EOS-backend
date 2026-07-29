import {
  Injectable,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import {
  BorrowerType,
  CreateBorrowRecordDto,
} from './dto/create-borrow-record.dto';
import {
  BorrowRecordAction,
  UpdateBorrowRecordDto,
} from './dto/update-borrow-record.dto';
import {
  BorrowStatus,
  SearchBorrowRecordsDto,
} from './dto/search-borrow-records.dto';
import { GetMyBorrowedDto } from './dto/get-my-borrowed.dto';
import { PrismaService } from '../../../prisma/prisma.service';
import type { Prisma } from '../../../../generated/prisma/client';
import type { JwtPayload } from '../../../auth/interfaces/jwt-payload.interface';

const RENEWAL_PERIOD_DAYS = 14;
const MS_PER_DAY = 24 * 60 * 60 * 1000;
// The schema has no fine/rate column or renewal-limit column, so both of
// these are plain business constants applied in code, same spirit as
// RENEWAL_PERIOD_DAYS above.
const FINE_PER_DAY_AMOUNT = 5;
const MAX_RENEWALS = 2;
// Concurrent-borrow cap — students only. Faculty are staff, not the abuse
// case this guards against, so they stay uncapped (same reasoning as
// MAX_RENEWALS/FINE_PER_DAY_AMOUNT: a plain in-code constant, no policy table).
const MAX_ACTIVE_BORROWS_PER_STUDENT = 3;

function startOfDay(date: Date | string) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function daysBetween(later: Date | string, earlier: Date | string) {
  return Math.round(
    (startOfDay(later).getTime() - startOfDay(earlier).getTime()) / MS_PER_DAY,
  );
}

const RECORD_INCLUDE = {
  books: {
    select: {
      id: true,
      title: true,
      qr_code: true,
    },
  },
  students: {
    select: {
      id: true,
      student_id_no: true,
      soa_applications: {
        select: {
          first_name: true,
          last_name: true,
        },
      },
    },
  },
  faculty: {
    select: {
      id: true,
      first_name: true,
      last_name: true,
    },
  },
};

type BorrowRecordWithRelations = Prisma.book_borrow_recordsGetPayload<{
  include: typeof RECORD_INCLUDE;
}>;

function formatRecord(record: BorrowRecordWithRelations) {
  const isOverdue =
    record.status === 'borrowed' &&
    startOfDay(record.due_date) < startOfDay(new Date());

  const returnedLate =
    record.status === 'returned' &&
    record.returned_date &&
    startOfDay(record.returned_date) > startOfDay(record.due_date);

  const daysOverdue = isOverdue ? daysBetween(new Date(), record.due_date) : 0;
  const daysLate =
    returnedLate && record.returned_date
      ? daysBetween(record.returned_date, record.due_date)
      : 0;

  return {
    id: record.id,
    book: {
      id: record.books.id,
      title: record.books.title,
      qr_code: record.books.qr_code,
    },
    borrower_type: record.borrower_type,
    student: record.students
      ? {
          id: record.students.id,
          student_id_no: record.students.student_id_no,
          // students has no name columns of its own (only faculty and
          // soa_applications do) — fall back to a labeled id rather than
          // null when there's no linked soa_application to pull a real
          // name from. This is a display placeholder, not a real name.
          name: record.students.soa_applications
            ? `${record.students.soa_applications.first_name} ${record.students.soa_applications.last_name ?? ''}`.trim()
            : `Student ${record.students.student_id_no}`,
        }
      : null,
    faculty: record.faculty
      ? {
          id: record.faculty.id,
          name: `${record.faculty.first_name} ${record.faculty.last_name}`,
        }
      : null,
    borrowed_date: record.borrowed_date,
    due_date: record.due_date,
    returned_date: record.returned_date,
    status: record.status,
    renewal_count: record.renewal_count,
    last_renewed_at: record.last_renewed_at,
    is_overdue: isOverdue,
    days_overdue: daysOverdue,
    returned_late: !!returnedLate,
    days_late: daysLate,
    // Computed, not persisted — schema has no fine column. FINE_PER_DAY_AMOUNT
    // is a placeholder business rate; days_overdue applies while still
    // borrowed (accruing), days_late applies once returned (final amount owed).
    fine_amount: (isOverdue ? daysOverdue : daysLate) * FINE_PER_DAY_AMOUNT,
  };
}

@Injectable()
export class BorrowRecordsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateBorrowRecordDto, currentUser: JwtPayload) {
    if (!currentUser) {
      throw new ForbiddenException('No authenticated user found.');
    }

    return this.prisma.$transaction(async (tx) => {
      // Check book
      const book = await tx.books.findUnique({
        where: {
          id: dto.book_id,
        },
      });

      if (!book) {
        throw new NotFoundException('Book not found.');
      }

      // Borrower validation — resolve exactly one of student_id/faculty_id
      // from the *declared* borrower_type, so a stray opposite-type id in
      // the body can never end up persisted alongside it (the schema's
      // student_id/faculty_id pair is meant to be mutually exclusive per
      // borrower_type; formatRecord() assumes only one is ever populated).
      let studentId: number | null = null;
      let facultyId: number | null = null;

      if (currentUser.role === 'student') {
        // Self-service students may only ever borrow for themselves —
        // nothing in the DTO/role check otherwise stops a student account
        // from naming an arbitrary student_id or borrowing as faculty.
        if (dto.borrower_type !== BorrowerType.student) {
          throw new ForbiddenException(
            'Students may only create borrow records for themselves.',
          );
        }

        const ownStudent = await tx.students.findUnique({
          where: { user_id: currentUser.sub },
        });

        if (!ownStudent) {
          throw new NotFoundException(
            'No student profile is linked to this account.',
          );
        }

        if (dto.student_id && dto.student_id !== ownStudent.id) {
          throw new ForbiddenException(
            'Students may only create borrow records for themselves.',
          );
        }

        studentId = ownStudent.id;
      } else if (dto.borrower_type === BorrowerType.student) {
        if (!dto.student_id) {
          throw new BadRequestException('Student ID is required.');
        }

        const student = await tx.students.findUnique({
          where: { id: dto.student_id },
        });

        if (!student) {
          throw new NotFoundException('Student not found.');
        }

        studentId = dto.student_id;
      } else {
        if (!dto.faculty_id) {
          throw new BadRequestException('Faculty ID is required.');
        }

        const faculty = await tx.faculty.findUnique({
          where: { id: dto.faculty_id },
        });

        if (!faculty) {
          throw new NotFoundException('Faculty not found.');
        }

        facultyId = dto.faculty_id;
      }

      // Single read covers all three borrower-side rules below (overdue
      // block, same-book duplicate, concurrent cap) — one round trip
      // instead of three separate findFirst/count calls. Each borrow record
      // is tiny and a borrower's active count is bounded (students are
      // capped at MAX_ACTIVE_BORROWS_PER_STUDENT; faculty, while uncapped,
      // realistically never hold enough concurrently for this to matter),
      // so fetching the full active set and checking it in memory is both
      // fewer queries and simpler than composing three separate WHERE
      // clauses against the same rows.
      const activeBorrows = await tx.book_borrow_records.findMany({
        where: {
          status: 'borrowed',
          student_id: studentId ?? undefined,
          faculty_id: facultyId ?? undefined,
        },
        select: { book_id: true, due_date: true },
      });

      // A borrower with any overdue book anywhere is blocked from taking out
      // anything new until it's resolved — otherwise overdue debt has no
      // real consequence and can grow unbounded across many different
      // books. Checked first since it's a blanket condition, not specific
      // to dto.book_id (unlike the two checks below).
      const hasOverdueBorrow = activeBorrows.some(
        (r) => startOfDay(r.due_date) < startOfDay(new Date()),
      );

      if (hasOverdueBorrow) {
        throw new ConflictException(
          'This borrower has an overdue book and cannot borrow additional books until it is returned.',
        );
      }

      // Same borrower can't have two active borrows of the same book —
      // checked before the copies count so the more specific "you already
      // have this book" conflict isn't masked by "no copies available"
      // when the last remaining copy happens to be this exact borrower's.
      const hasDuplicateBorrow = activeBorrows.some(
        (r) => r.book_id === dto.book_id,
      );

      if (hasDuplicateBorrow) {
        throw new ConflictException(
          'This borrower already has an active, unreturned copy of this book.',
        );
      }

      // Concurrent-borrow cap — students only (faculty are uncapped). A real
      // library limits how many books a member can hold at once.
      if (studentId && activeBorrows.length >= MAX_ACTIVE_BORROWS_PER_STUDENT) {
        throw new ConflictException(
          `Students may not have more than ${MAX_ACTIVE_BORROWS_PER_STUDENT} books borrowed at once.`,
        );
      }

      // Atomic check-and-decrement: the WHERE and the decrement happen in
      // one statement, so two truly concurrent borrows of the last copy
      // can't both pass a stale "available_copies > 0" read and both
      // succeed (which a separate read-then-update, as this used to be,
      // cannot guarantee under concurrent access). count === 0 means either
      // the book vanished (already excluded — checked above) or every copy
      // is currently out.
      const decremented = await tx.books.updateMany({
        where: {
          id: dto.book_id,
          available_copies: { gt: 0 },
        },
        data: {
          available_copies: { decrement: 1 },
        },
      });

      if (decremented.count === 0) {
        throw new ConflictException('No copies available for borrowing.');
      }

      const borrow = await tx.book_borrow_records.create({
        data: {
          book_id: dto.book_id,
          borrower_type: dto.borrower_type,
          student_id: studentId,
          faculty_id: facultyId,
          due_date: new Date(dto.due_date),
        },
        include: RECORD_INCLUDE,
      });

      return formatRecord(borrow);
    });
  }

  // Resolves the caller's own students/faculty row id from their user id.
  // Used to scope reads to "my own records" for student/faculty callers —
  // library/admin and every other role keep unrestricted read access,
  // matching the read contract on the other library submodules.
  private async resolveOwnStudentId(userId: number): Promise<number | null> {
    const student = await this.prisma.students.findUnique({
      where: { user_id: userId },
    });
    return student?.id ?? null;
  }

  private async resolveOwnFacultyId(userId: number): Promise<number | null> {
    const faculty = await this.prisma.faculty.findUnique({
      where: { user_id: userId },
    });
    return faculty?.id ?? null;
  }

  // GET /me/library/borrowed — a student's own borrow history in a flatter
  // shape than formatRecord()'s (no nested student/faculty block, since the
  // caller *is* the student; no is_overdue/fine_amount, not part of this
  // endpoint's documented contract). A caller with no linked student profile
  // gets an empty list via the same -1 sentinel id used elsewhere, not an
  // error, matching findAll()'s ownership-scoping behavior.
  async findMyBorrowed(dto: GetMyBorrowedDto, currentUser: JwtPayload) {
    const ownStudentId =
      (await this.resolveOwnStudentId(currentUser.sub)) ?? -1;

    const where: Prisma.book_borrow_recordsWhereInput = {
      student_id: ownStudentId,
    };

    // 'overdue' isn't a value ever persisted in the status column (see the
    // same mapping in findAll() above) — map it to the derived predicate.
    if (dto.status === BorrowStatus.overdue) {
      where.status = 'borrowed';
      where.due_date = { lt: new Date() };
    } else if (dto.status) {
      where.status = dto.status;
    }

    const records = await this.prisma.book_borrow_records.findMany({
      where,
      include: {
        books: {
          select: { title: true, author: true },
        },
      },
      orderBy: { borrowed_date: 'desc' },
    });

    return {
      success: true,
      message: 'Borrowed books fetched successfully',
      data: records.map((record) => ({
        id: record.id,
        book_id: record.book_id,
        title: record.books.title,
        author: record.books.author,
        borrowed_date: record.borrowed_date,
        due_date: record.due_date,
        returned_date: record.returned_date,
        status: record.status,
        renewal_count: record.renewal_count,
        last_renewed_at: record.last_renewed_at,
      })),
    };
  }

  async findAll(searchDto: SearchBorrowRecordsDto, currentUser: JwtPayload) {
    const {
      borrower_type,
      student_id,
      faculty_id,
      book_id,
      status,
      overdue = false,
      page = 1,
      page_size = 20,
    } = searchDto;

    const where: Prisma.book_borrow_recordsWhereInput = {};

    if (borrower_type) {
      where.borrower_type = borrower_type;
    }

    if (student_id) {
      where.student_id = student_id;
    }

    if (faculty_id) {
      where.faculty_id = faculty_id;
    }

    if (book_id) {
      where.book_id = book_id;
    }

    if (status) {
      where.status = status;
    }

    // `status=overdue` is a query-side convenience, not a stored value —
    // the DB only ever persists 'borrowed'/'returned' (see remove()/update()
    // below), so an equality filter on the literal 'overdue' enum value
    // would always match zero rows. Map it to the same derived predicate
    // `overdue=true` already uses. `overdue=true` still takes precedence
    // when both are supplied, matching its existing override behavior.
    if (overdue || status === BorrowStatus.overdue) {
      where.status = 'borrowed';
      where.due_date = {
        lt: new Date(),
      };
    }

    // A student/faculty caller can only ever see their own borrowing
    // history — any student_id/faculty_id filter they passed is overridden,
    // not rejected, since narrowing to "yourself" isn't an error, just the
    // only visibility you have. -1 is an unmatched sentinel id for a caller
    // with no linked profile, so the query returns an empty page instead
    // of throwing.
    if (currentUser?.role === 'student') {
      where.student_id = (await this.resolveOwnStudentId(currentUser.sub)) ?? -1;
    } else if (currentUser?.role === 'faculty') {
      where.faculty_id = (await this.resolveOwnFacultyId(currentUser.sub)) ?? -1;
    }

    const [records, total] = await this.prisma.$transaction([
      this.prisma.book_borrow_records.findMany({
        where,
        include: RECORD_INCLUDE,
        orderBy: {
          borrowed_date: 'desc',
        },
        skip: (page - 1) * page_size,
        take: page_size,
      }),

      this.prisma.book_borrow_records.count({
        where,
      }),
    ]);

    return {
      page,
      page_size,
      total,
      data: records.map(formatRecord),
    };
  }

  async findOne(id: number, currentUser: JwtPayload) {
    const record = await this.prisma.book_borrow_records.findUnique({
      where: {
        id,
      },
      include: RECORD_INCLUDE,
    });

    if (!record) {
      throw new NotFoundException('Borrow record not found.');
    }

    // Same ownership scoping as findAll(). A 404 (not 403) on someone
    // else's record is intentional — it doesn't confirm to an
    // unauthorized caller that the record exists at all.
    if (currentUser?.role === 'student') {
      const ownId = await this.resolveOwnStudentId(currentUser.sub);
      if (record.student_id !== ownId) {
        throw new NotFoundException('Borrow record not found.');
      }
    } else if (currentUser?.role === 'faculty') {
      const ownId = await this.resolveOwnFacultyId(currentUser.sub);
      if (record.faculty_id !== ownId) {
        throw new NotFoundException('Borrow record not found.');
      }
    }

    return formatRecord(record);
  }

  async update(id: number, dto: UpdateBorrowRecordDto) {
    const record = await this.prisma.book_borrow_records.findUnique({
      where: {
        id,
      },
    });

    if (!record) {
      throw new NotFoundException('Borrow record not found.');
    }

    if (record.status === 'returned') {
      throw new ConflictException('This book has already been returned.');
    }

    if (dto.action === BorrowRecordAction.return) {
      const returnedDate = dto.return_date
        ? new Date(dto.return_date)
        : new Date();

      if (startOfDay(returnedDate) < startOfDay(record.borrowed_date)) {
        throw new BadRequestException(
          'Return date cannot be before the borrowed date.',
        );
      }

      return this.prisma.$transaction(async (tx) => {
        // Conditional on status: 'borrowed' so two concurrent "return" calls
        // on the same record can't both succeed and double-increment
        // available_copies — the outer status check above reads a stale
        // snapshot from before the transaction opened, so it alone can't
        // prevent that race; this updateMany's WHERE is the one that
        // actually enforces it atomically.
        const result = await tx.book_borrow_records.updateMany({
          where: {
            id,
            status: 'borrowed',
          },
          data: {
            status: 'returned',
            returned_date: returnedDate,
          },
        });

        if (result.count === 0) {
          throw new ConflictException('This book has already been returned.');
        }

        await tx.books.update({
          where: {
            id: record.book_id,
          },
          data: {
            available_copies: {
              increment: 1,
            },
          },
        });

        const updated = await tx.book_borrow_records.findUniqueOrThrow({
          where: { id },
          include: RECORD_INCLUDE,
        });

        return formatRecord(updated);
      });
    }

    // Renew
    const isCurrentlyOverdue =
      startOfDay(record.due_date) < startOfDay(new Date());

    if (isCurrentlyOverdue) {
      throw new ConflictException(
        'Cannot renew an overdue book. Please return it and issue a new borrow record instead.',
      );
    }

    if (record.renewal_count >= MAX_RENEWALS) {
      throw new ConflictException(
        `Maximum renewal limit (${MAX_RENEWALS}) reached for this borrow record.`,
      );
    }

    const newDueDate = dto.new_due_date
      ? new Date(dto.new_due_date)
      : new Date(
          record.due_date.getTime() + RENEWAL_PERIOD_DAYS * 24 * 60 * 60 * 1000,
        );

    if (newDueDate <= record.due_date) {
      throw new BadRequestException(
        'New due date must be after the current due date.',
      );
    }

    const renewed = await this.prisma.book_borrow_records.update({
      where: {
        id,
      },
      data: {
        due_date: newDueDate,
        renewal_count: {
          increment: 1,
        },
        last_renewed_at: new Date(),
      },
      include: RECORD_INCLUDE,
    });

    return formatRecord(renewed);
  }

  async remove(id: number) {
    const record = await this.prisma.book_borrow_records.findUnique({
      where: {
        id,
      },
    });

    if (!record) {
      throw new NotFoundException('Borrow record not found.');
    }

    // A returned record is permanent borrowing history, not a live/active
    // state — the books module already refuses to delete a book that has
    // *any* borrow_records row (P2003, "existing borrow history"), so
    // letting this endpoint freely delete a returned row would erase
    // exactly the audit trail that guard exists to protect. An active
    // 'borrowed' record hasn't become history yet (no successful loan was
    // ever completed), so it can still be deleted to undo a mistaken issue,
    // same as before.
    if (record.status !== 'borrowed') {
      throw new ConflictException(
        'Cannot delete a returned borrow record — it is part of the permanent borrowing history.',
      );
    }

    await this.prisma.$transaction([
      this.prisma.book_borrow_records.delete({
        where: {
          id,
        },
      }),
      this.prisma.books.update({
        where: {
          id: record.book_id,
        },
        data: {
          available_copies: {
            increment: 1,
          },
        },
      }),
    ]);

    return {
      message: 'Borrow record deleted successfully.',
    };
  }
}
