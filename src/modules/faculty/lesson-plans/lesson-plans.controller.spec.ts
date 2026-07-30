jest.mock('../../../../generated/prisma/client', () => ({
  PrismaClient: class {},
}));
jest.mock('@prisma/adapter-pg', () => ({ PrismaPg: class {} }));

import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { LessonPlansController } from './lesson-plans.controller';
import { LessonPlansService } from './lesson-plans.service';

describe('LessonPlansController', () => {
  let controller: LessonPlansController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LessonPlansController],
      providers: [
        LessonPlansService,
        {
          provide: PrismaService,
          useValue: {
            faculty: { findUnique: jest.fn() },
            subjects: { findUnique: jest.fn() },
            classes: { findUnique: jest.fn() },
            faculty_subject_class_mapping: { findFirst: jest.fn() },
            lesson_plans: {
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

    controller = module.get<LessonPlansController>(LessonPlansController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
