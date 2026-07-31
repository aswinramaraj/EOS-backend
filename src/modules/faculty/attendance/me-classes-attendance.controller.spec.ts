jest.mock('../../../../generated/prisma/client', () => ({
  PrismaClient: class {},
}));
jest.mock('@prisma/adapter-pg', () => ({ PrismaPg: class {} }));

import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { MeClassesAttendanceController } from './me-classes-attendance.controller';
import { AttendanceService } from './attendance.service';

describe('MeClassesAttendanceController', () => {
  let controller: MeClassesAttendanceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MeClassesAttendanceController],
      providers: [
        AttendanceService,
        {
          provide: PrismaService,
          useValue: {
            faculty: { findUnique: jest.fn() },
            classes: { findUnique: jest.fn() },
            subjects: { findUnique: jest.fn() },
            students: { findUnique: jest.fn(), findMany: jest.fn() },
            faculty_subject_class_mapping: { findFirst: jest.fn() },
            parent_student_mapping: {
              findMany: jest.fn(),
              findFirst: jest.fn(),
            },
            attendance_records: {
              create: jest.fn(),
              findMany: jest.fn(),
              count: jest.fn(),
              findUnique: jest.fn(),
              findFirst: jest.fn(),
              update: jest.fn(),
            },
            $transaction: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<MeClassesAttendanceController>(
      MeClassesAttendanceController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
