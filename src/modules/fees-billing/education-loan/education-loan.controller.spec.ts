import { Test, TestingModule } from '@nestjs/testing';
import { EducationLoanController } from './education-loan.controller';
import { EducationLoanService } from './education-loan.service';

describe('EducationLoanController', () => {
  let controller: EducationLoanController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EducationLoanController],
      providers: [EducationLoanService],
    }).compile();

    controller = module.get<EducationLoanController>(EducationLoanController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
