import { Test, TestingModule } from '@nestjs/testing';
import { LmsNotesController } from './lms-notes.controller';
import { LmsNotesService } from './lms-notes.service';

describe('LmsNotesController', () => {
  let controller: LmsNotesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LmsNotesController],
      providers: [LmsNotesService],
    }).compile();

    controller = module.get<LmsNotesController>(LmsNotesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
