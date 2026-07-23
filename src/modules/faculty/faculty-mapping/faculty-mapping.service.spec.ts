import { Test, TestingModule } from '@nestjs/testing';
import { FacultyMappingService } from './faculty-mapping.service';

describe('FacultyMappingService', () => {
  let service: FacultyMappingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FacultyMappingService],
    }).compile();

    service = module.get<FacultyMappingService>(FacultyMappingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
