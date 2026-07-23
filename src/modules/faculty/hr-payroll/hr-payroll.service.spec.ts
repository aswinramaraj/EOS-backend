import { Test, TestingModule } from '@nestjs/testing';
import { HrPayrollService } from './hr-payroll.service';

describe('HrPayrollService', () => {
  let service: HrPayrollService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HrPayrollService],
    }).compile();

    service = module.get<HrPayrollService>(HrPayrollService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
