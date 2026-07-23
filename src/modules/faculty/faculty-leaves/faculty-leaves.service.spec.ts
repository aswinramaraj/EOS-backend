import { Test, TestingModule } from '@nestjs/testing';
import { FacultyLeavesService } from './faculty-leaves.service';

describe('FacultyLeavesService', () => {
  let service: FacultyLeavesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FacultyLeavesService],
    }).compile();

    service = module.get<FacultyLeavesService>(FacultyLeavesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
