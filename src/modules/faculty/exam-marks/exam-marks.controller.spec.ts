jest.mock('../../../../generated/prisma/client', () => ({
  PrismaClient: class {},
}));
jest.mock('@prisma/adapter-pg', () => ({ PrismaPg: class {} }));

import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { ExamMarksController } from './exam-marks.controller';
import { ExamMarksService } from './exam-marks.service';

describe('ExamMarksController', () => {
  let controller: ExamMarksController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExamMarksController],
      providers: [
        ExamMarksService,
        {
          provide: PrismaService,
          useValue: {
            faculty: { findUnique: jest.fn() },
            students: { findUnique: jest.fn(), findMany: jest.fn() },
            faculty_subject_class_mapping: { findFirst: jest.fn() },
            exam_subject_mapping: { findUnique: jest.fn() },
            exam_marks: {
              create: jest.fn(),
              findFirst: jest.fn(),
              findMany: jest.fn(),
              count: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            $transaction: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ExamMarksController>(ExamMarksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
