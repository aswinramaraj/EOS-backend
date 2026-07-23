import { Test, TestingModule } from '@nestjs/testing';
import { ExamTypesController } from './exam-types.controller';
import { ExamTypesService } from './exam-types.service';

describe('ExamTypesController', () => {
  let controller: ExamTypesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExamTypesController],
      providers: [ExamTypesService],
    }).compile();

    controller = module.get<ExamTypesController>(ExamTypesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
