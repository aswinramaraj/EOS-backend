import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { ROLES } from 'src/common/constants/roles.constant';
import { ROLES_KEY } from 'src/auth/decorators/roles.decorator';
import { soa_status_enum, student_type_enum } from 'generated/prisma/client';
import { SoaApplicationsController } from './soa-applications.controller';
import { SoaApplicationsService } from './soa-applications.service';
import type { CreatePerfectEntryDto } from './dto/create-perfect-entry.dto';

describe('SoaApplicationsController', () => {
  let controller: SoaApplicationsController;
  const soaApplicationsService = {
    create: jest.fn(),
    updateStatus: jest.fn(),
    perfectEntry: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SoaApplicationsController],
      providers: [
        { provide: SoaApplicationsService, useValue: soaApplicationsService },
      ],
    }).compile();

    controller = module.get<SoaApplicationsController>(
      SoaApplicationsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('restricts create() to the admin role', () => {
    const reflector = new Reflector();
    // eslint-disable-next-line @typescript-eslint/unbound-method -- reading decorator metadata off the method, never invoking it detached from `controller`
    const roles = reflector.get<string[]>(ROLES_KEY, controller.create);
    expect(roles).toEqual([ROLES.ADMIN]);
  });

  it('delegates create() to SoaApplicationsService', () => {
    const dto = { first_name: 'Arjun' };
    void controller.create(dto);

    expect(soaApplicationsService.create).toHaveBeenCalledWith(dto);
  });

  it('restricts updateStatus() to the admin role', () => {
    const reflector = new Reflector();
    // eslint-disable-next-line @typescript-eslint/unbound-method -- reading decorator metadata off the method, never invoking it detached from `controller`
    const roles = reflector.get<string[]>(ROLES_KEY, controller.updateStatus);
    expect(roles).toEqual([ROLES.ADMIN]);
  });

  it('delegates updateStatus() to SoaApplicationsService with the parsed id', () => {
    const dto = { status: soa_status_enum.fees_paid };
    void controller.updateStatus(1042, dto);

    expect(soaApplicationsService.updateStatus).toHaveBeenCalledWith(1042, dto);
  });

  it('restricts perfectEntry() to the admin role', () => {
    const reflector = new Reflector();
    // eslint-disable-next-line @typescript-eslint/unbound-method -- reading decorator metadata off the method, never invoking it detached from `controller`
    const roles = reflector.get<string[]>(ROLES_KEY, controller.perfectEntry);
    expect(roles).toEqual([ROLES.ADMIN]);
  });

  it('delegates perfectEntry() to SoaApplicationsService with the parsed id', () => {
    const dto: CreatePerfectEntryDto = {
      email: 'arjun.k@student.college.edu',
      course_id: 8,
      quota_id: 2,
      batch_id: 4,
      student_id_no: 'AIDS2026041',
      student_type: student_type_enum.dayscholar,
    };
    void controller.perfectEntry(1042, dto);

    expect(soaApplicationsService.perfectEntry).toHaveBeenCalledWith(1042, dto);
  });
});
