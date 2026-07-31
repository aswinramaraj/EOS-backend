jest.mock('../../../../generated/prisma/client', () => ({
  PrismaClient: class {},
}));
jest.mock('@prisma/adapter-pg', () => ({ PrismaPg: class {} }));

import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { LmsNotesController } from './lms-notes.controller';
import { LmsNotesService } from './lms-notes.service';

describe('LmsNotesController', () => {
  let controller: LmsNotesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LmsNotesController],
      providers: [
        LmsNotesService,
        {
          provide: PrismaService,
          useValue: {
            faculty: { findUnique: jest.fn() },
            subjects: { findUnique: jest.fn() },
            classes: { findUnique: jest.fn() },
            faculty_subject_class_mapping: { findFirst: jest.fn() },
            lms_notes: {
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

    controller = module.get<LmsNotesController>(LmsNotesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
