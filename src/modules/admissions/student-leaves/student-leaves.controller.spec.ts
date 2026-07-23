import { Test, TestingModule } from '@nestjs/testing';
import { StudentLeavesController } from './student-leaves.controller';
import { StudentLeavesService } from './student-leaves.service';

describe('StudentLeavesController', () => {
  let controller: StudentLeavesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StudentLeavesController],
      providers: [StudentLeavesService],
    }).compile();

    controller = module.get<StudentLeavesController>(StudentLeavesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
