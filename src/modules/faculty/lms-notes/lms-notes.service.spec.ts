import { Test, TestingModule } from '@nestjs/testing';
import { LmsNotesService } from './lms-notes.service';

describe('LmsNotesService', () => {
  let service: LmsNotesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LmsNotesService],
    }).compile();

    service = module.get<LmsNotesService>(LmsNotesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
