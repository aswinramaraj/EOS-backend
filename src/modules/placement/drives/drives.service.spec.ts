import { Test, TestingModule } from '@nestjs/testing';
import { DrivesService } from './drives.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { CompaniesService } from '../companies/companies.service';

// The real PrismaService pulls in the generated Prisma client, which uses
// `import.meta.url` and cannot be parsed by ts-jest's CommonJS transform.
// Mock it out before it's ever required.
jest.mock('../../../prisma/prisma.service', () => ({
  PrismaService: class PrismaServiceMock {},
}));

describe('DrivesService', () => {
  let service: DrivesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DrivesService,
        { provide: PrismaService, useValue: {} },
        { provide: CompaniesService, useValue: {} },
      ],
    }).compile();

    service = module.get<DrivesService>(DrivesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
