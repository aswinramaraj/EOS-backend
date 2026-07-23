import { Test, TestingModule } from '@nestjs/testing';
import { StudentProfilesController } from './student-profiles.controller';
import { StudentProfilesService } from './student-profiles.service';

describe('StudentProfilesController', () => {
  let controller: StudentProfilesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StudentProfilesController],
      providers: [StudentProfilesService],
    }).compile();

    controller = module.get<StudentProfilesController>(StudentProfilesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
