import { Test, TestingModule } from '@nestjs/testing';
import { ExamTypesService } from './exam-types.service';

describe('ExamTypesService', () => {
  let service: ExamTypesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExamTypesService],
    }).compile();

    service = module.get<ExamTypesService>(ExamTypesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
