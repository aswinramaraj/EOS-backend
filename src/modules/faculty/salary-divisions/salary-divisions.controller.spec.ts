jest.mock('../../../../generated/prisma/client', () => ({
  PrismaClient: class {},
}));
jest.mock('@prisma/adapter-pg', () => ({ PrismaPg: class {} }));

import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { SalaryDivisionsController } from './salary-divisions.controller';
import { SalaryDivisionsService } from './salary-divisions.service';

describe('SalaryDivisionsController', () => {
  let controller: SalaryDivisionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SalaryDivisionsController],
      providers: [
        SalaryDivisionsService,
        {
          provide: PrismaService,
          useValue: {
            faculty: { findUnique: jest.fn() },
            salary_divisions: {
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

    controller = module.get<SalaryDivisionsController>(
      SalaryDivisionsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
