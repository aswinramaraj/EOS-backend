jest.mock('../../../../generated/prisma/client', () => ({
  PrismaClient: class {},
}));
jest.mock('@prisma/adapter-pg', () => ({ PrismaPg: class {} }));

import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { HrPayrollService } from './hr-payroll.service';

describe('HrPayrollService', () => {
  let service: HrPayrollService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HrPayrollService,
        {
          provide: PrismaService,
          useValue: {
            faculty: { findUnique: jest.fn() },
            salary_payments: {
              create: jest.fn(),
              findMany: jest.fn(),
              count: jest.fn(),
              findFirst: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            $transaction: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<HrPayrollService>(HrPayrollService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
