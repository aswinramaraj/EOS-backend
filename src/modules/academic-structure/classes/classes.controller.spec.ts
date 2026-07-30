jest.mock('../../../../generated/prisma/client', () => ({
  PrismaClient: class {},
}));
jest.mock('@prisma/adapter-pg', () => ({ PrismaPg: class {} }));

import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { ClassesController } from './classes.controller';
import { ClassesService } from './classes.service';

describe('ClassesController', () => {
  let controller: ClassesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClassesController],
      providers: [
        ClassesService,
        {
          provide: PrismaService,
          useValue: {
            faculty: { findUnique: jest.fn() },
            classes: { findUnique: jest.fn() },
            class_mentors: {
              create: jest.fn(),
              update: jest.fn(),
              findMany: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    controller = module.get<ClassesController>(ClassesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
