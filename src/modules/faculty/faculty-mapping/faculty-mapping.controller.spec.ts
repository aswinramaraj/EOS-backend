import { Test, TestingModule } from '@nestjs/testing';
import { FacultyMappingController } from './faculty-mapping.controller';
import { FacultyMappingService } from './faculty-mapping.service';

describe('FacultyMappingController', () => {
  let controller: FacultyMappingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FacultyMappingController],
      providers: [FacultyMappingService],
    }).compile();

    controller = module.get<FacultyMappingController>(FacultyMappingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
