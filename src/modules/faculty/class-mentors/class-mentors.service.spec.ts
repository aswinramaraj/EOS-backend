jest.mock('../../../../generated/prisma/client', () => ({
  PrismaClient: class {},
}));
jest.mock('@prisma/adapter-pg', () => ({ PrismaPg: class {} }));

import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { ClassMentorsService } from './class-mentors.service';

describe('ClassMentorsService', () => {
  let service: ClassMentorsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClassMentorsService,
        {
          provide: PrismaService,
          useValue: {
            faculty: { findUnique: jest.fn() },
            students: { findUnique: jest.fn() },
            class_mentors: { findFirst: jest.fn(), findMany: jest.fn() },
            student_drive_applications: { findMany: jest.fn() },
            parent_student_mapping: { findFirst: jest.fn() },
          },
        },
      ],
    }).compile();

    service = module.get<ClassMentorsService>(ClassMentorsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
