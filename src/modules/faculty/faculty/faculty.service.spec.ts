jest.mock('../../../../generated/prisma/client', () => ({
  PrismaClient: class {},
}));
jest.mock('@prisma/adapter-pg', () => ({ PrismaPg: class {} }));

import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { FacultyService } from './faculty.service';

describe('FacultyService', () => {
  let service: FacultyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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

    service = module.get<FacultyService>(FacultyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
