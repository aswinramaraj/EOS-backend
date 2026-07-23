import { Test, TestingModule } from '@nestjs/testing';
import { HrPayrollController } from './hr-payroll.controller';
import { HrPayrollService } from './hr-payroll.service';

describe('HrPayrollController', () => {
  let controller: HrPayrollController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HrPayrollController],
      providers: [HrPayrollService],
    }).compile();

    controller = module.get<HrPayrollController>(HrPayrollController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
