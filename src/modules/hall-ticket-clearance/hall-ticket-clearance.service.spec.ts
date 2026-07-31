jest.mock('../../../generated/prisma/client', () => ({
  PrismaClient: class {},
}));
jest.mock('@prisma/adapter-pg', () => ({ PrismaPg: class {} }));

import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { HallTicketClearanceService } from './hall-ticket-clearance.service';

describe('HallTicketClearanceService', () => {
  let service: HallTicketClearanceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HallTicketClearanceService,
        {
          provide: PrismaService,
          useValue: {
            students: { findUnique: jest.fn() },
            exams: { findUnique: jest.fn() },
            exam_subject_mapping: { findMany: jest.fn() },
            hall_ticket_clearance_exceptions: {
              create: jest.fn(),
              findFirst: jest.fn(),
              findMany: jest.fn(),
              count: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            $transaction: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<HallTicketClearanceService>(
      HallTicketClearanceService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
