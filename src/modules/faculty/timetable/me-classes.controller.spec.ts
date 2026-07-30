jest.mock('../../../../generated/prisma/client', () => ({
  PrismaClient: class {},
}));
jest.mock('@prisma/adapter-pg', () => ({ PrismaPg: class {} }));

import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { MeClassesController } from './me-classes.controller';
import { TimetableService } from './timetable.service';

describe('MeClassesController', () => {
  let controller: MeClassesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MeClassesController],
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

    controller = module.get<MeClassesController>(MeClassesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
