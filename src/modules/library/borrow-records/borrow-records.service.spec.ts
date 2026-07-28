jest.mock('src/prisma/prisma.service', () => ({
  PrismaService: jest.fn(),
}));

import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { BorrowRecordsService } from './borrow-records.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { BorrowerType } from './dto/create-borrow-record.dto';
import { BorrowRecordAction } from './dto/update-borrow-record.dto';

describe('BorrowRecordsService', () => {
  let service: BorrowRecordsService;

  const mockPrismaService = {
    books: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    students: {
      findUnique: jest.fn(),
    },
    faculty: {
      findUnique: jest.fn(),
    },
    book_borrow_records: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  // Runs both the callback form (used inside create/return) and the
  // array form (used by findAll/remove) against the same mock instance,
  // matching how Prisma's interactive vs. batch transactions behave.
  const runTransaction = (arg: any) =>
    typeof arg === 'function' ? arg(mockPrismaService) : Promise.all(arg);

  const includedBook = { id: 2, title: 'Clean Code', qr_code: 'BK-000123' };
  const includedStudent = {
    id: 5,
    student_id_no: 'AIDS2026043',
    soa_applications: { first_name: 'Mellow', last_name: 'Kumar' },
  };

  function makeRecord(overrides: Partial<Record<string, any>> = {}) {
    return {
      id: 3,
      book_id: 2,
      borrower_type: 'student',
      student_id: 5,
      faculty_id: null,
      borrowed_date: new Date('2026-07-28'),
      due_date: new Date('2026-08-15'),
      returned_date: null,
      status: 'borrowed',
      renewal_count: 0,
      last_renewed_at: null,
      books: includedBook,
      students: includedStudent,
      faculty: null,
      ...overrides,
    };
  }

  beforeEach(async () => {
    jest.resetAllMocks();
    mockPrismaService.$transaction.mockImplementation(runTransaction);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BorrowRecordsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<BorrowRecordsService>(BorrowRecordsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const studentDto = {
      book_id: 2,
      borrower_type: BorrowerType.student,
      student_id: 5,
      due_date: '2026-08-15',
    };

    it('should create a borrow record for a student successfully', async () => {
      mockPrismaService.books.findUnique.mockResolvedValue({
        id: 2,
        available_copies: 3,
      });
      mockPrismaService.students.findUnique.mockResolvedValue({ id: 5 });
      mockPrismaService.book_borrow_records.findFirst.mockResolvedValue(null);
      mockPrismaService.book_borrow_records.create.mockResolvedValue(
        makeRecord(),
      );
      mockPrismaService.books.update.mockResolvedValue({});

      const result = await service.create(studentDto);

      expect(mockPrismaService.book_borrow_records.create).toHaveBeenCalledWith(
        {
          data: {
            book_id: 2,
            borrower_type: 'student',
            student_id: 5,
            faculty_id: undefined,
            due_date: new Date('2026-08-15'),
          },
          include: expect.any(Object),
        },
      );
      expect(mockPrismaService.books.update).toHaveBeenCalledWith({
        where: { id: 2 },
        data: { available_copies: { decrement: 1 } },
      });
      expect(result).toMatchObject({
        id: 3,
        status: 'borrowed',
        student: {
          id: 5,
          student_id_no: 'AIDS2026043',
          name: 'Mellow Kumar',
        },
      });
    });

    it('should create a borrow record for faculty successfully', async () => {
      const facultyDto = {
        book_id: 2,
        borrower_type: BorrowerType.faculty,
        faculty_id: 9,
        due_date: '2026-08-15',
      };

      mockPrismaService.books.findUnique.mockResolvedValue({
        id: 2,
        available_copies: 1,
      });
      mockPrismaService.faculty.findUnique.mockResolvedValue({ id: 9 });
      mockPrismaService.book_borrow_records.findFirst.mockResolvedValue(null);
      mockPrismaService.book_borrow_records.create.mockResolvedValue(
        makeRecord({
          borrower_type: 'faculty',
          student_id: null,
          faculty_id: 9,
          students: null,
          faculty: { id: 9, first_name: 'John', last_name: 'Doe' },
        }),
      );

      const result = await service.create(facultyDto);

      expect(mockPrismaService.students.findUnique).not.toHaveBeenCalled();
      expect(result.faculty).toEqual({ id: 9, name: 'John Doe' });
      expect(result.student).toBeNull();
    });

    it('should throw NotFoundException when book does not exist', async () => {
      mockPrismaService.books.findUnique.mockResolvedValue(null);

      await expect(service.create(studentDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(
        mockPrismaService.book_borrow_records.create,
      ).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when no copies are available', async () => {
      mockPrismaService.books.findUnique.mockResolvedValue({
        id: 2,
        available_copies: 0,
      });

      await expect(service.create(studentDto)).rejects.toThrow(
        ConflictException,
      );
      expect(
        mockPrismaService.book_borrow_records.create,
      ).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when borrower_type is student but student_id is missing', async () => {
      mockPrismaService.books.findUnique.mockResolvedValue({
        id: 2,
        available_copies: 3,
      });

      await expect(
        service.create({
          book_id: 2,
          borrower_type: BorrowerType.student,
          due_date: '2026-08-15',
        } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when borrower_type is faculty but faculty_id is missing', async () => {
      mockPrismaService.books.findUnique.mockResolvedValue({
        id: 2,
        available_copies: 3,
      });

      await expect(
        service.create({
          book_id: 2,
          borrower_type: BorrowerType.faculty,
          due_date: '2026-08-15',
        } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when student does not exist', async () => {
      mockPrismaService.books.findUnique.mockResolvedValue({
        id: 2,
        available_copies: 3,
      });
      mockPrismaService.students.findUnique.mockResolvedValue(null);

      await expect(service.create(studentDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(
        mockPrismaService.book_borrow_records.create,
      ).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when faculty does not exist', async () => {
      const facultyDto = {
        book_id: 2,
        borrower_type: BorrowerType.faculty,
        faculty_id: 9,
        due_date: '2026-08-15',
      };
      mockPrismaService.books.findUnique.mockResolvedValue({
        id: 2,
        available_copies: 3,
      });
      mockPrismaService.faculty.findUnique.mockResolvedValue(null);

      await expect(service.create(facultyDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException when the borrower already has an active borrow of this book', async () => {
      mockPrismaService.books.findUnique.mockResolvedValue({
        id: 2,
        available_copies: 3,
      });
      mockPrismaService.students.findUnique.mockResolvedValue({ id: 5 });
      mockPrismaService.book_borrow_records.findFirst.mockResolvedValue(
        makeRecord(),
      );

      await expect(service.create(studentDto)).rejects.toThrow(
        ConflictException,
      );
      expect(
        mockPrismaService.book_borrow_records.create,
      ).not.toHaveBeenCalled();
      expect(mockPrismaService.books.update).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return paginated results with no filters', async () => {
      mockPrismaService.book_borrow_records.findMany.mockResolvedValue([
        makeRecord(),
      ]);
      mockPrismaService.book_borrow_records.count.mockResolvedValue(1);

      const result = await service.findAll({});

      expect(
        mockPrismaService.book_borrow_records.findMany,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {},
          skip: 0,
          take: 20,
        }),
      );
      expect(result.total).toBe(1);
      expect(result.data[0]).toMatchObject({ id: 3, status: 'borrowed' });
    });

    it('should apply borrower/status/book filters and pagination', async () => {
      mockPrismaService.book_borrow_records.findMany.mockResolvedValue([]);
      mockPrismaService.book_borrow_records.count.mockResolvedValue(0);

      await service.findAll({
        borrower_type: BorrowerType.student,
        student_id: 5,
        book_id: 2,
        status: 'borrowed' as any,
        page: 2,
        page_size: 10,
      });

      expect(
        mockPrismaService.book_borrow_records.findMany,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            borrower_type: 'student',
            student_id: 5,
            book_id: 2,
            status: 'borrowed',
          },
          skip: 10,
          take: 10,
        }),
      );
    });

    it('should override status with the overdue filter when overdue=true', async () => {
      mockPrismaService.book_borrow_records.findMany.mockResolvedValue([]);
      mockPrismaService.book_borrow_records.count.mockResolvedValue(0);

      await service.findAll({ status: 'returned' as any, overdue: true });

      expect(
        mockPrismaService.book_borrow_records.findMany,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            status: 'borrowed',
            due_date: { lt: expect.any(Date) },
          },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return the formatted record when found', async () => {
      mockPrismaService.book_borrow_records.findUnique.mockResolvedValue(
        makeRecord(),
      );

      const result = await service.findOne(3);

      expect(
        mockPrismaService.book_borrow_records.findUnique,
      ).toHaveBeenCalledWith({
        where: { id: 3 },
        include: expect.any(Object),
      });
      expect(result.id).toBe(3);
    });

    it('should throw NotFoundException when not found', async () => {
      mockPrismaService.book_borrow_records.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should throw NotFoundException when the record does not exist', async () => {
      mockPrismaService.book_borrow_records.findUnique.mockResolvedValue(null);

      await expect(
        service.update(3, { action: BorrowRecordAction.return }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when the record is already returned', async () => {
      mockPrismaService.book_borrow_records.findUnique.mockResolvedValue(
        makeRecord({
          status: 'returned',
          returned_date: new Date('2026-08-01'),
        }),
      );

      await expect(
        service.update(3, { action: BorrowRecordAction.return }),
      ).rejects.toThrow(ConflictException);
      expect(
        mockPrismaService.book_borrow_records.update,
      ).not.toHaveBeenCalled();
    });

    describe('action: return', () => {
      it('should mark the record returned, restore available_copies, and use the given return_date', async () => {
        mockPrismaService.book_borrow_records.findUnique.mockResolvedValue(
          makeRecord({ due_date: new Date('2026-07-18') }),
        );
        mockPrismaService.book_borrow_records.update.mockResolvedValue(
          makeRecord({
            status: 'returned',
            due_date: new Date('2026-07-18'),
            returned_date: new Date('2026-07-28'),
          }),
        );
        mockPrismaService.books.update.mockResolvedValue({});

        const result = await service.update(3, {
          action: BorrowRecordAction.return,
          return_date: '2026-07-28',
        });

        expect(
          mockPrismaService.book_borrow_records.update,
        ).toHaveBeenCalledWith({
          where: { id: 3 },
          data: {
            status: 'returned',
            returned_date: new Date('2026-07-28'),
          },
          include: expect.any(Object),
        });
        expect(mockPrismaService.books.update).toHaveBeenCalledWith({
          where: { id: 2 },
          data: { available_copies: { increment: 1 } },
        });
        expect(result.status).toBe('returned');
        expect(result.returned_late).toBe(true);
        expect(result.days_late).toBe(10);
      });

      it('should default return_date to now when not provided', async () => {
        mockPrismaService.book_borrow_records.findUnique.mockResolvedValue(
          makeRecord(),
        );
        mockPrismaService.book_borrow_records.update.mockResolvedValue(
          makeRecord({ status: 'returned', returned_date: new Date() }),
        );
        mockPrismaService.books.update.mockResolvedValue({});

        await service.update(3, { action: BorrowRecordAction.return });

        expect(
          mockPrismaService.book_borrow_records.update,
        ).toHaveBeenCalledWith({
          where: { id: 3 },
          data: {
            status: 'returned',
            returned_date: expect.any(Date),
          },
          include: expect.any(Object),
        });
      });
    });

    describe('action: renew', () => {
      it('should extend due_date by 14 days by default and bump renewal_count', async () => {
        mockPrismaService.book_borrow_records.findUnique.mockResolvedValue(
          makeRecord({ due_date: new Date('2026-08-01') }),
        );
        mockPrismaService.book_borrow_records.update.mockResolvedValue(
          makeRecord({
            due_date: new Date('2026-08-15'),
            renewal_count: 1,
            last_renewed_at: new Date(),
          }),
        );

        const result = await service.update(3, {
          action: BorrowRecordAction.renew,
        });

        expect(
          mockPrismaService.book_borrow_records.update,
        ).toHaveBeenCalledWith({
          where: { id: 3 },
          data: {
            due_date: new Date('2026-08-15'),
            renewal_count: { increment: 1 },
            last_renewed_at: expect.any(Date),
          },
          include: expect.any(Object),
        });
        expect(result.renewal_count).toBe(1);
      });

      it('should use the provided new_due_date when given', async () => {
        mockPrismaService.book_borrow_records.findUnique.mockResolvedValue(
          makeRecord({ due_date: new Date('2026-08-01') }),
        );
        mockPrismaService.book_borrow_records.update.mockResolvedValue(
          makeRecord({ due_date: new Date('2026-09-01'), renewal_count: 1 }),
        );

        await service.update(3, {
          action: BorrowRecordAction.renew,
          new_due_date: '2026-09-01',
        });

        expect(
          mockPrismaService.book_borrow_records.update,
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              due_date: new Date('2026-09-01'),
            }),
          }),
        );
      });

      it('should throw BadRequestException when new_due_date is not after the current due_date', async () => {
        mockPrismaService.book_borrow_records.findUnique.mockResolvedValue(
          makeRecord({ due_date: new Date('2026-08-01') }),
        );

        await expect(
          service.update(3, {
            action: BorrowRecordAction.renew,
            new_due_date: '2026-07-01',
          }),
        ).rejects.toThrow(BadRequestException);
        expect(
          mockPrismaService.book_borrow_records.update,
        ).not.toHaveBeenCalled();
      });
    });
  });

  describe('remove', () => {
    it('should throw NotFoundException when the record does not exist', async () => {
      mockPrismaService.book_borrow_records.findUnique.mockResolvedValue(null);

      await expect(service.remove(3)).rejects.toThrow(NotFoundException);
    });

    it('should delete and restore available_copies when the record is still borrowed', async () => {
      mockPrismaService.book_borrow_records.findUnique.mockResolvedValue(
        makeRecord({ status: 'borrowed' }),
      );
      mockPrismaService.book_borrow_records.delete.mockResolvedValue({});
      mockPrismaService.books.update.mockResolvedValue({});

      const result = await service.remove(3);

      expect(mockPrismaService.book_borrow_records.delete).toHaveBeenCalledWith(
        { where: { id: 3 } },
      );
      expect(mockPrismaService.books.update).toHaveBeenCalledWith({
        where: { id: 2 },
        data: { available_copies: { increment: 1 } },
      });
      expect(result).toEqual({
        message: 'Borrow record deleted successfully.',
      });
    });

    it('should delete without restoring available_copies when the record was already returned', async () => {
      mockPrismaService.book_borrow_records.findUnique.mockResolvedValue(
        makeRecord({
          status: 'returned',
          returned_date: new Date('2026-08-01'),
        }),
      );
      mockPrismaService.book_borrow_records.delete.mockResolvedValue({});

      const result = await service.remove(3);

      expect(mockPrismaService.book_borrow_records.delete).toHaveBeenCalledWith(
        { where: { id: 3 } },
      );
      expect(mockPrismaService.books.update).not.toHaveBeenCalled();
      expect(result).toEqual({
        message: 'Borrow record deleted successfully.',
      });
    });
  });
});
