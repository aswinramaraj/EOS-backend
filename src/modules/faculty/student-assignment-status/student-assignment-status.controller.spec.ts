jest.mock('../../../../generated/prisma/client', () => ({
  PrismaClient: class {},
}));
jest.mock('@prisma/adapter-pg', () => ({ PrismaPg: class {} }));

import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { StudentAssignmentStatusController } from './student-assignment-status.controller';
import { StudentAssignmentStatusService } from './student-assignment-status.service';

describe('StudentAssignmentStatusController', () => {
  let controller: StudentAssignmentStatusController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StudentAssignmentStatusController],
      providers: [
        StudentAssignmentStatusService,
        {
          provide: PrismaService,
          useValue: {
            faculty: { findUnique: jest.fn() },
            students: { findUnique: jest.fn() },
            assignments: { findUnique: jest.fn() },
            student_assignment_status: {
              create: jest.fn(),
              findMany: jest.fn(),
              count: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            $transaction: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<StudentAssignmentStatusController>(
      StudentAssignmentStatusController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
