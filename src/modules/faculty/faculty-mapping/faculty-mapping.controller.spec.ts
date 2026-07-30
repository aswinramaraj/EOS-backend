jest.mock('../../../../generated/prisma/client', () => ({
  PrismaClient: class {},
}));
jest.mock('@prisma/adapter-pg', () => ({ PrismaPg: class {} }));

import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { FacultyMappingController } from './faculty-mapping.controller';
import { FacultyMappingService } from './faculty-mapping.service';

describe('FacultyMappingController', () => {
  let controller: FacultyMappingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FacultyMappingController],
      providers: [
        FacultyMappingService,
        {
          provide: PrismaService,
          useValue: {
            faculty: { findUnique: jest.fn() },
            subjects: { findUnique: jest.fn() },
            classes: { findUnique: jest.fn() },
            lms_notes: { create: jest.fn() },
            faculty_subject_class_mapping: {
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

    controller = module.get<FacultyMappingController>(FacultyMappingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
