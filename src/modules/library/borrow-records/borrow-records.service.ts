import {
  Injectable,
  BadRequestException,
  ConflictException,
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
import { SearchBorrowRecordsDto } from './dto/search-borrow-records.dto';
import { PrismaService } from '../../../prisma/prisma.service';
import type { Prisma } from '../../../../generated/prisma/client';

const RENEWAL_PERIOD_DAYS = 14;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

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
          name: record.students.soa_applications
            ? `${record.students.soa_applications.first_name} ${record.students.soa_applications.last_name ?? ''}`.trim()
            : null,
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
    days_overdue: isOverdue ? daysBetween(new Date(), record.due_date) : 0,
    returned_late: !!returnedLate,
    days_late:
      returnedLate && record.returned_date
        ? daysBetween(record.returned_date, record.due_date)
        : 0,
  };
}

@Injectable()
export class BorrowRecordsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateBorrowRecordDto) {
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

      // Available copies
      if (book.available_copies <= 0) {
        throw new ConflictException('No copies available for borrowing.');
      }

      // Borrower validation
      if (dto.borrower_type === BorrowerType.student && !dto.student_id) {
        throw new BadRequestException('Student ID is required.');
      }

      if (dto.borrower_type === BorrowerType.faculty && !dto.faculty_id) {
        throw new BadRequestException('Faculty ID is required.');
      }

      // Student exists
      if (dto.student_id) {
        const student = await tx.students.findUnique({
          where: {
            id: dto.student_id,
          },
        });

        if (!student) {
          throw new NotFoundException('Student not found.');
        }
      }

      // Faculty exists
      if (dto.faculty_id) {
        const faculty = await tx.faculty.findUnique({
          where: {
            id: dto.faculty_id,
          },
        });

        if (!faculty) {
          throw new NotFoundException('Faculty not found.');
        }
      }

      // Same borrower can't have two active borrows of the same book
      const activeBorrow = await tx.book_borrow_records.findFirst({
        where: {
          book_id: dto.book_id,
          status: 'borrowed',
          student_id: dto.student_id ?? undefined,
          faculty_id: dto.faculty_id ?? undefined,
        },
      });

      if (activeBorrow) {
        throw new ConflictException(
          'This borrower already has an active, unreturned copy of this book.',
        );
      }

      // Create borrow record
      const borrow = await tx.book_borrow_records.create({
        data: {
          book_id: dto.book_id,
          borrower_type: dto.borrower_type,
          student_id: dto.student_id,
          faculty_id: dto.faculty_id,
          due_date: new Date(dto.due_date),
        },
        include: RECORD_INCLUDE,
      });

      // Reduce available copies
      await tx.books.update({
        where: {
          id: dto.book_id,
        },
        data: {
          available_copies: {
            decrement: 1,
          },
        },
      });

      return formatRecord(borrow);
    });
  }

  async findAll(searchDto: SearchBorrowRecordsDto) {
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

    if (overdue) {
      where.status = 'borrowed';
      where.due_date = {
        lt: new Date(),
      };
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

  async findOne(id: number) {
    const record = await this.prisma.book_borrow_records.findUnique({
      where: {
        id,
      },
      include: RECORD_INCLUDE,
    });

    if (!record) {
      throw new NotFoundException('Borrow record not found.');
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
      return this.prisma.$transaction(async (tx) => {
        const updated = await tx.book_borrow_records.update({
          where: {
            id,
          },
          data: {
            status: 'returned',
            returned_date: dto.return_date
              ? new Date(dto.return_date)
              : new Date(),
          },
          include: RECORD_INCLUDE,
        });

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

        return formatRecord(updated);
      });
    }

    // Renew
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

    if (record.status === 'borrowed') {
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
    } else {
      await this.prisma.book_borrow_records.delete({
        where: {
          id,
        },
      });
    }

    return {
      message: 'Borrow record deleted successfully.',
    };
  }
}
