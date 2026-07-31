jest.mock('../../../../generated/prisma/client', () => ({
  PrismaClient: class {},
}));
jest.mock('@prisma/adapter-pg', () => ({ PrismaPg: class {} }));

import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { PayslipRequestsService } from './payslip-requests.service';

describe('PayslipRequestsService', () => {
  let service: PayslipRequestsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PayslipRequestsService,
        {
          provide: PrismaService,
          useValue: {
            faculty: { findUnique: jest.fn() },
            payslip_requests: {
              create: jest.fn(),
              findMany: jest.fn(),
              count: jest.fn(),
              findUnique: jest.fn(),
              findFirst: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            $transaction: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PayslipRequestsService>(PayslipRequestsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
