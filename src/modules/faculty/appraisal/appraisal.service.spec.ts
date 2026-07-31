jest.mock('../../../../generated/prisma/client', () => ({
  PrismaClient: class {},
}));
jest.mock('@prisma/adapter-pg', () => ({ PrismaPg: class {} }));

import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { AppraisalService } from './appraisal.service';

describe('AppraisalService', () => {
  let service: AppraisalService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppraisalService,
        {
          provide: PrismaService,
          useValue: {
            faculty: { findUnique: jest.fn() },
            appraisal_criteria: { findMany: jest.fn() },
            appraisal_requests: {
              create: jest.fn(),
              findMany: jest.fn(),
              count: jest.fn(),
              findFirst: jest.fn(),
              findUnique: jest.fn(),
              findUniqueOrThrow: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            appraisal_entries: {
              createMany: jest.fn(),
              findMany: jest.fn(),
              update: jest.fn(),
            },
            $transaction: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AppraisalService>(AppraisalService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
