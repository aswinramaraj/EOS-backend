jest.mock('../../../../generated/prisma/client', () => ({
  PrismaClient: class {},
}));
jest.mock('@prisma/adapter-pg', () => ({ PrismaPg: class {} }));

import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { MediaRequestsService } from './media-requests.service';

describe('MediaRequestsService', () => {
  let service: MediaRequestsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MediaRequestsService,
        {
          provide: PrismaService,
          useValue: {
            faculty: { findUnique: jest.fn() },
            media_requests: {
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

    service = module.get<MediaRequestsService>(MediaRequestsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
