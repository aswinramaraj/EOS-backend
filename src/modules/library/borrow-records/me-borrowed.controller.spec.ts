jest.mock('src/prisma/prisma.service', () => ({
  PrismaService: jest.fn(),
}));

import { Test, TestingModule } from '@nestjs/testing';
import { MeBorrowedController } from './me-borrowed.controller';
import { BorrowRecordsService } from './borrow-records.service';

describe('MeBorrowedController', () => {
  let controller: MeBorrowedController;

  const mockBorrowRecordsService = {
    findMyBorrowed: jest.fn(),
  };

  const studentUser = { sub: 40, email: 'student@eos.test', role: 'student', roleId: 4 };

  beforeEach(async () => {
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MeBorrowedController],
      providers: [
        {
          provide: BorrowRecordsService,
          useValue: mockBorrowRecordsService,
        },
      ],
    }).compile();

    controller = module.get<MeBorrowedController>(MeBorrowedController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findMyBorrowed should call service.findMyBorrowed with the query dto, the current user, and return its result', async () => {
    const query = { status: 'borrowed' as any };
    const expected = {
      success: true,
      message: 'Borrowed books fetched successfully',
      data: [],
    };
    mockBorrowRecordsService.findMyBorrowed.mockResolvedValue(expected);

    const result = await controller.findMyBorrowed(query, studentUser);

    expect(mockBorrowRecordsService.findMyBorrowed).toHaveBeenCalledWith(
      query,
      studentUser,
    );
    expect(result).toBe(expected);
  });
});
