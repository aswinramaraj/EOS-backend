import { Test, TestingModule } from '@nestjs/testing';
import { CompaniesService } from './companies.service';
import { PrismaService } from '../../../prisma/prisma.service';

// The real PrismaService pulls in the generated Prisma client, which uses
// `import.meta.url` and cannot be parsed by ts-jest's CommonJS transform.
// Mock it out before it's ever required.
jest.mock('../../../prisma/prisma.service', () => ({
  PrismaService: class PrismaServiceMock {},
}));

describe('CompaniesService', () => {
  let service: CompaniesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CompaniesService, { provide: PrismaService, useValue: {} }],
    }).compile();

    service = module.get<CompaniesService>(CompaniesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
