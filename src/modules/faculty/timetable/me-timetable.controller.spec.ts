jest.mock('../../../../generated/prisma/client', () => ({
  PrismaClient: class {},
}));
jest.mock('@prisma/adapter-pg', () => ({ PrismaPg: class {} }));

import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { MeTimetableController } from './me-timetable.controller';
import { TimetableService } from './timetable.service';

describe('MeTimetableController', () => {
  let controller: MeTimetableController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MeTimetableController],
      providers: [
        TimetableService,
        {
          provide: PrismaService,
          useValue: {
            faculty: { findUnique: jest.fn() },
            subjects: { findUnique: jest.fn() },
            classes: { findUnique: jest.fn() },
            students: { findUnique: jest.fn() },
            faculty_subject_class_mapping: { findFirst: jest.fn() },
            timetable_slots: {
              create: jest.fn(),
              findMany: jest.fn(),
              count: jest.fn(),
              findUnique: jest.fn(),
              findFirst: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            $transaction: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<MeTimetableController>(MeTimetableController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
