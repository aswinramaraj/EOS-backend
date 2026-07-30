jest.mock('../../../../generated/prisma/client', () => ({
  PrismaClient: class {},
}));
jest.mock('@prisma/adapter-pg', () => ({ PrismaPg: class {} }));

import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { HolidaySlotsService } from './holiday-slots.service';

describe('HolidaySlotsService', () => {
  let service: HolidaySlotsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HolidaySlotsService,
        {
          provide: PrismaService,
          useValue: {
            faculty: { findUnique: jest.fn() },
            holiday_slots: {
              create: jest.fn(),
              findMany: jest.fn(),
              count: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            faculty_holiday_mapping: {
              create: jest.fn(),
              findMany: jest.fn(),
              count: jest.fn(),
              findUnique: jest.fn(),
              delete: jest.fn(),
            },
            $transaction: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<HolidaySlotsService>(HolidaySlotsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
