import { Test, TestingModule } from '@nestjs/testing';
import { EducationLoanService } from './education-loan.service';

describe('EducationLoanService', () => {
  let service: EducationLoanService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EducationLoanService],
    }).compile();

    service = module.get<EducationLoanService>(EducationLoanService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
