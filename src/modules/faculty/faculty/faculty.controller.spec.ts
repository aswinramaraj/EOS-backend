jest.mock('../../../../generated/prisma/client', () => ({
  PrismaClient: class {},
}));
jest.mock('@prisma/adapter-pg', () => ({ PrismaPg: class {} }));

import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { FacultyController } from './faculty.controller';
import { FacultyService } from './faculty.service';

describe('FacultyController', () => {
  let controller: FacultyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FacultyController],
      providers: [
        FacultyService,
        {
          provide: PrismaService,
          useValue: {
            departments: { findUnique: jest.fn() },
            users: {
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
            },
            roles: { findUnique: jest.fn() },
            faculty: {
              findUnique: jest.fn(),
              findMany: jest.fn(),
              count: jest.fn(),
              update: jest.fn(),
            },
            faculty_sensitive_info: { create: jest.fn(), upsert: jest.fn() },
            $transaction: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<FacultyController>(FacultyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
