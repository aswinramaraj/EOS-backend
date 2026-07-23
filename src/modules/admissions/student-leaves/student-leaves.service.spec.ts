import { Test, TestingModule } from '@nestjs/testing';
import { StudentLeavesService } from './student-leaves.service';

describe('StudentLeavesService', () => {
  let service: StudentLeavesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StudentLeavesService],
    }).compile();

    service = module.get<StudentLeavesService>(StudentLeavesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
