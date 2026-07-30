jest.mock('../../../../generated/prisma/client', () => ({
  PrismaClient: class {},
}));
jest.mock('@prisma/adapter-pg', () => ({ PrismaPg: class {} }));

import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { StudentLeavesService } from './student-leaves.service';

describe('StudentLeavesService', () => {
  let service: StudentLeavesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudentLeavesService,
        {
          provide: PrismaService,
          useValue: {
            faculty: { findUnique: jest.fn() },
            class_mentors: { findMany: jest.fn(), findFirst: jest.fn() },
            student_leaves: {
              findUnique: jest.fn(),
              findMany: jest.fn(),
              count: jest.fn(),
              update: jest.fn(),
            },
            $transaction: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<StudentLeavesService>(StudentLeavesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
