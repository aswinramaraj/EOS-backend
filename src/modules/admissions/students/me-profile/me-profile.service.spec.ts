import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { MeProfileService } from './me-profile.service';

describe('MeProfileService', () => {
  let service: MeProfileService;
  let prisma: {
    students: { findUnique: jest.Mock };
    student_contacts: { upsert: jest.Mock; findUnique: jest.Mock };
    student_addresses: { upsert: jest.Mock; findMany: jest.Mock };
    $transaction: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      students: { findUnique: jest.fn() },
      student_contacts: { upsert: jest.fn(), findUnique: jest.fn() },
      student_addresses: { upsert: jest.fn(), findMany: jest.fn() },
      $transaction: jest.fn((cb: (tx: unknown) => unknown) => cb(prisma)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MeProfileService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<MeProfileService>(MeProfileService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('throws 404 STUDENT_NOT_FOUND when the JWT user has no linked student record', async () => {
    prisma.students.findUnique.mockResolvedValue(null);

    await expect(service.updateMyProfile(999, {})).rejects.toMatchObject({
      status: 404,
      response: { errorCode: 'STUDENT_NOT_FOUND' },
    });
    await expect(service.updateMyProfile(999, {})).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('throws 422 INVALID_ADDRESS_TYPE for an unrecognized address_type', async () => {
    prisma.students.findUnique.mockResolvedValue({ id: 42 });

    await expect(
      service.updateMyProfile(1, {
        addresses: [{ address_type: 'current', address_line: 'X' } as any],
      }),
    ).rejects.toMatchObject({
      status: 422,
      response: { errorCode: 'INVALID_ADDRESS_TYPE' },
    });
    await expect(
      service.updateMyProfile(1, {
        addresses: [{ address_type: 'current' } as any],
      }),
    ).rejects.toBeInstanceOf(UnprocessableEntityException);
  });

  it('upserts contacts and each address, scoped to the resolved student_id', async () => {
    prisma.students.findUnique.mockResolvedValue({ id: 42 });
    prisma.student_contacts.upsert.mockResolvedValue({
      student_email1: null,
      student_email2: null,
      student_mobile: '9876500099',
    });
    prisma.student_addresses.upsert.mockResolvedValue({
      address_type: 'temporary',
      address_line: 'Hostel Block A, Room 204',
      city: 'Coimbatore',
      state: 'Tamil Nadu',
      pincode: '641004',
    });

    const result = await service.updateMyProfile(1, {
      student_mobile: '9876500099',
      addresses: [
        {
          address_type: 'temporary',
          address_line: 'Hostel Block A, Room 204',
          city: 'Coimbatore',
          state: 'Tamil Nadu',
          pincode: '641004',
        },
      ],
    });

    expect(prisma.students.findUnique).toHaveBeenCalledWith({
      where: { user_id: 1 },
      select: { id: true },
    });
    expect(prisma.student_contacts.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ where: { student_id: 42 } }),
    );
    expect(prisma.student_addresses.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          student_id_address_type: {
            student_id: 42,
            address_type: 'temporary',
          },
        },
      }),
    );
    expect(result.contacts?.student_mobile).toBe('9876500099');
    expect(result.addresses).toHaveLength(1);
    expect(result.addresses[0].address_type).toBe('temporary');
  });

  it('leaves addresses untouched when the request only updates contact fields', async () => {
    prisma.students.findUnique.mockResolvedValue({ id: 42 });
    prisma.student_contacts.upsert.mockResolvedValue({
      student_email1: null,
      student_email2: null,
      student_mobile: '9876500099',
    });
    prisma.student_addresses.findMany.mockResolvedValue([
      {
        address_type: 'permanent',
        address_line: 'Old address',
        city: 'Chennai',
        state: 'TN',
        pincode: '600001',
      },
    ]);

    const result = await service.updateMyProfile(1, {
      student_mobile: '9876500099',
    });

    expect(prisma.student_addresses.upsert).not.toHaveBeenCalled();
    expect(prisma.student_addresses.findMany).toHaveBeenCalledWith({
      where: { student_id: 42 },
    });
    expect(result.addresses).toHaveLength(1);
    expect(result.addresses[0].city).toBe('Chennai');
  });

  describe('getMyProfile', () => {
    it('throws 404 STUDENT_NOT_FOUND when the JWT user has no linked student record', async () => {
      prisma.students.findUnique.mockResolvedValue(null);

      await expect(service.getMyProfile(999)).rejects.toMatchObject({
        status: 404,
        response: { errorCode: 'STUDENT_NOT_FOUND' },
      });
    });

    it('assembles the full profile, resolving names/section from the joined relations', async () => {
      prisma.students.findUnique.mockResolvedValue({
        student_id_no: 'AIDS2026041',
        roll_no: '41',
        register_no: null,
        student_type: 'dayscholar',
        gender: 'Male',
        date_of_birth: new Date('2008-04-12T00:00:00.000Z'),
        blood_group: 'O+',
        is_first_graduate: true,
        courses: { name: 'B.Tech Artificial Intelligence & Data Science' },
        quotas: { name: 'Government Quota' },
        classes: { section: 'A' },
        batches: { name: '2026-2030' },
        student_addresses: [
          {
            address_type: 'permanent',
            address_line: '12 Gandhi St',
            city: 'Coimbatore',
            state: 'Tamil Nadu',
            pincode: '641001',
          },
        ],
        student_identity_marks: [
          { mark_number: 1, description: 'Mole on left hand' },
        ],
        student_family_details: {
          father_name: 'Ravi Kumar',
          father_qualification: null,
          father_occupation: 'Business',
          father_annual_income: null,
          father_email: null,
          father_mobile: null,
          mother_name: 'Lakshmi Kumar',
          mother_qualification: null,
          mother_occupation: 'Homemaker',
          mother_annual_income: null,
          mother_email: null,
          mother_mobile: null,
        },
        student_contacts: {
          student_email1: 'arjun.k@example.com',
          student_email2: null,
          student_mobile: '9876500001',
        },
      });

      const result = await service.getMyProfile(1);

      expect(prisma.students.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { user_id: 1 } }),
      );
      expect(result.student_id_no).toBe('AIDS2026041');
      expect(result.course_name).toBe(
        'B.Tech Artificial Intelligence & Data Science',
      );
      expect(result.quota_name).toBe('Government Quota');
      expect(result.batch_name).toBe('2026-2030');
      expect(result.class_section).toBe('A');
      expect(result.date_of_birth).toBe('2008-04-12');
      expect(result.addresses).toHaveLength(1);
      expect(result.identity_marks).toHaveLength(1);
      expect(result.family_details?.father_name).toBe('Ravi Kumar');
      expect(result.contacts?.student_mobile).toBe('9876500001');
    });

    it('returns class_section as null when no class has been assigned yet', async () => {
      prisma.students.findUnique.mockResolvedValue({
        student_id_no: 'AIDS2026041',
        roll_no: null,
        register_no: null,
        student_type: 'dayscholar',
        gender: null,
        date_of_birth: null,
        blood_group: null,
        is_first_graduate: false,
        courses: { name: 'B.Tech CSE' },
        quotas: { name: 'Management' },
        classes: null,
        batches: { name: '2026-2030' },
        student_addresses: [],
        student_identity_marks: [],
        student_family_details: null,
        student_contacts: null,
      });

      const result = await service.getMyProfile(1);

      expect(result.class_section).toBeNull();
      expect(result.date_of_birth).toBeNull();
      expect(result.family_details).toBeNull();
      expect(result.contacts).toBeNull();
      expect(result.addresses).toEqual([]);
      expect(result.identity_marks).toEqual([]);
    });

    it('wraps a DB failure as 500 INTERNAL_ERROR', async () => {
      prisma.students.findUnique.mockRejectedValue(
        new Error('connection lost'),
      );

      await expect(service.getMyProfile(1)).rejects.toMatchObject({
        status: 500,
        response: { errorCode: 'INTERNAL_ERROR' },
      });
    });
  });
});
