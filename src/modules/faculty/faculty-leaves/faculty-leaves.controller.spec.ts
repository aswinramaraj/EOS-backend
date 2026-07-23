import { Test, TestingModule } from '@nestjs/testing';
import { FacultyLeavesController } from './faculty-leaves.controller';
import { FacultyLeavesService } from './faculty-leaves.service';

describe('FacultyLeavesController', () => {
  let controller: FacultyLeavesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FacultyLeavesController],
      providers: [FacultyLeavesService],
    }).compile();

    controller = module.get<FacultyLeavesController>(FacultyLeavesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
