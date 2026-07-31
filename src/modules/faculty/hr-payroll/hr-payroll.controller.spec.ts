jest.mock('../../../../generated/prisma/client', () => ({
  PrismaClient: class {},
}));
jest.mock('@prisma/adapter-pg', () => ({ PrismaPg: class {} }));

import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { HrPayrollController } from './hr-payroll.controller';
import { HrPayrollService } from './hr-payroll.service';

describe('HrPayrollController', () => {
  let controller: HrPayrollController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HrPayrollController],
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

    controller = module.get<HrPayrollController>(HrPayrollController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
