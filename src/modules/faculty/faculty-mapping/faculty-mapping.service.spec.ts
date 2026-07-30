jest.mock('../../../../generated/prisma/client', () => ({
  PrismaClient: class {},
}));
jest.mock('@prisma/adapter-pg', () => ({ PrismaPg: class {} }));

import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { FacultyMappingService } from './faculty-mapping.service';

describe('FacultyMappingService', () => {
  let service: FacultyMappingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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

    service = module.get<FacultyMappingService>(FacultyMappingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
