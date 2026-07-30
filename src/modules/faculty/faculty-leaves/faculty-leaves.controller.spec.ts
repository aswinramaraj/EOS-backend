jest.mock('../../../../generated/prisma/client', () => ({
  PrismaClient: class {},
}));
jest.mock('@prisma/adapter-pg', () => ({ PrismaPg: class {} }));

import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { FacultyLeavesController } from './faculty-leaves.controller';
import { FacultyLeavesService } from './faculty-leaves.service';

describe('FacultyLeavesController', () => {
  let controller: FacultyLeavesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FacultyLeavesController],
      providers: [
        FacultyLeavesService,
        {
          provide: PrismaService,
          useValue: {
            faculty: { findUnique: jest.fn() },
            faculty_leaves: {
              create: jest.fn(),
              findMany: jest.fn(),
              count: jest.fn(),
              findFirst: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            $transaction: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<FacultyLeavesController>(FacultyLeavesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
