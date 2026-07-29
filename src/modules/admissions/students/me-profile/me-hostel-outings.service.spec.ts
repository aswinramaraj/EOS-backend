import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { MeHostelOutingsService } from './me-hostel-outings.service';

describe('MeHostelOutingsService', () => {
  let service: MeHostelOutingsService;
  let prisma: {
    students: { findUnique: jest.Mock };
    student_hostel_mapping: { findUnique: jest.Mock };
    hostel_outings: { create: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      students: { findUnique: jest.fn() },
      student_hostel_mapping: { findUnique: jest.fn() },
      hostel_outings: { create: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MeHostelOutingsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<MeHostelOutingsService>(MeHostelOutingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('creates a pending outing request scoped to the resolved student_id, enriched with room_number', async () => {
    prisma.students.findUnique.mockResolvedValue({ id: 8 });
    prisma.student_hostel_mapping.findUnique.mockResolvedValue({
      hostel_rooms: { room_number: 'A102' },
    });
    prisma.hostel_outings.create.mockResolvedValue({
      id: 88,
      from_date: new Date('2099-08-02T00:00:00.000Z'),
      to_date: new Date('2099-08-02T00:00:00.000Z'),
      start_time: new Date('1970-01-01T09:00:00.000Z'),
      return_time: new Date('1970-01-01T18:00:00.000Z'),
      reason: 'Family visit',
      status: 'pending',
    });

    const result = await service.createHostelOuting(103, {
      from_date: '2099-08-02',
      to_date: '2099-08-02',
      start_time: '09:00',
      return_time: '18:00',
      reason: 'Family visit',
    });

    expect(prisma.students.findUnique).toHaveBeenCalledWith({
      where: { user_id: 103 },
      select: { id: true },
    });
    expect(prisma.student_hostel_mapping.findUnique).toHaveBeenCalledWith({
      where: { student_id: 8 },
      select: { hostel_rooms: { select: { room_number: true } } },
    });
    const [createArgs] = prisma.hostel_outings.create.mock.calls[0] as [
      { data: Record<string, unknown> },
    ];
    expect(createArgs.data).toMatchObject({
      student_id: 8,
      reason: 'Family visit',
      status: 'pending',
    });
    expect(result).toEqual({
      id: 88,
      from_date: '2099-08-02',
      to_date: '2099-08-02',
      start_time: '09:00',
      return_time: '18:00',
      reason: 'Family visit',
      status: 'pending',
      room_number: 'A102',
    });
  });

  it('allows return_time to be omitted, returning null (not a fixed sentinel)', async () => {
    prisma.students.findUnique.mockResolvedValue({ id: 8 });
    prisma.student_hostel_mapping.findUnique.mockResolvedValue({
      hostel_rooms: { room_number: 'A102' },
    });
    prisma.hostel_outings.create.mockResolvedValue({
      id: 89,
      from_date: new Date('2099-08-02T00:00:00.000Z'),
      to_date: new Date('2099-08-03T00:00:00.000Z'),
      start_time: new Date('1970-01-01T09:00:00.000Z'),
      return_time: null,
      reason: null,
      status: 'pending',
    });

    const result = await service.createHostelOuting(103, {
      from_date: '2099-08-02',
      to_date: '2099-08-03',
      start_time: '09:00',
    });

    const [createArgs] = prisma.hostel_outings.create.mock.calls[0] as [
      { data: Record<string, unknown> },
    ];
    expect(createArgs.data.return_time).toBeNull();
    expect(result.return_time).toBeNull();
  });

  it('throws 422 INVALID_DATE_RANGE when from_date is in the past', async () => {
    await expect(
      service.createHostelOuting(103, {
        from_date: '2020-01-01',
        to_date: '2020-01-05',
        start_time: '09:00',
      }),
    ).rejects.toMatchObject({
      status: 422,
      response: { errorCode: 'INVALID_DATE_RANGE' },
    });
    expect(prisma.students.findUnique).not.toHaveBeenCalled();
  });

  it('throws 422 INVALID_DATE_RANGE when from_date is after to_date', async () => {
    await expect(
      service.createHostelOuting(103, {
        from_date: '2099-08-10',
        to_date: '2099-08-05',
        start_time: '09:00',
      }),
    ).rejects.toMatchObject({
      status: 422,
      response: { errorCode: 'INVALID_DATE_RANGE' },
    });
  });

  it('throws 422 INVALID_DATE_RANGE for a same-day outing where return_time is before start_time', async () => {
    await expect(
      service.createHostelOuting(103, {
        from_date: '2099-08-05',
        to_date: '2099-08-05',
        start_time: '18:00',
        return_time: '09:00',
      }),
    ).rejects.toMatchObject({
      status: 422,
      response: { errorCode: 'INVALID_DATE_RANGE' },
    });
    expect(prisma.students.findUnique).not.toHaveBeenCalled();
  });

  it('allows a same-day outing where return_time equals start_time (boundary)', async () => {
    prisma.students.findUnique.mockResolvedValue({ id: 8 });
    prisma.student_hostel_mapping.findUnique.mockResolvedValue({
      hostel_rooms: { room_number: 'A102' },
    });
    prisma.hostel_outings.create.mockResolvedValue({
      id: 90,
      from_date: new Date('2099-08-05T00:00:00.000Z'),
      to_date: new Date('2099-08-05T00:00:00.000Z'),
      start_time: new Date('1970-01-01T09:00:00.000Z'),
      return_time: new Date('1970-01-01T09:00:00.000Z'),
      reason: null,
      status: 'pending',
    });

    await expect(
      service.createHostelOuting(103, {
        from_date: '2099-08-05',
        to_date: '2099-08-05',
        start_time: '09:00',
        return_time: '09:00',
      }),
    ).resolves.toBeDefined();
  });

  it('allows a multi-day outing even when return_time reads "earlier" than start_time as a clock time', async () => {
    prisma.students.findUnique.mockResolvedValue({ id: 8 });
    prisma.student_hostel_mapping.findUnique.mockResolvedValue({
      hostel_rooms: { room_number: 'A102' },
    });
    prisma.hostel_outings.create.mockResolvedValue({
      id: 91,
      from_date: new Date('2099-08-05T00:00:00.000Z'),
      to_date: new Date('2099-08-07T00:00:00.000Z'),
      start_time: new Date('1970-01-01T18:00:00.000Z'),
      return_time: new Date('1970-01-01T09:00:00.000Z'),
      reason: null,
      status: 'pending',
    });

    await expect(
      service.createHostelOuting(103, {
        from_date: '2099-08-05',
        to_date: '2099-08-07',
        start_time: '18:00',
        return_time: '09:00',
      }),
    ).resolves.toBeDefined();
  });

  it('throws 404 STUDENT_NOT_FOUND when the JWT user has no linked student record', async () => {
    prisma.students.findUnique.mockResolvedValue(null);

    await expect(
      service.createHostelOuting(999, {
        from_date: '2099-08-02',
        to_date: '2099-08-02',
        start_time: '09:00',
      }),
    ).rejects.toMatchObject({
      status: 404,
      response: { errorCode: 'STUDENT_NOT_FOUND' },
    });
    expect(prisma.student_hostel_mapping.findUnique).not.toHaveBeenCalled();
  });

  it('throws 422 NOT_A_HOSTELLER when the caller has no student_hostel_mapping row', async () => {
    prisma.students.findUnique.mockResolvedValue({ id: 7 });
    prisma.student_hostel_mapping.findUnique.mockResolvedValue(null);

    await expect(
      service.createHostelOuting(7, {
        from_date: '2099-08-02',
        to_date: '2099-08-02',
        start_time: '09:00',
      }),
    ).rejects.toMatchObject({
      status: 422,
      response: { errorCode: 'NOT_A_HOSTELLER' },
    });
    expect(prisma.hostel_outings.create).not.toHaveBeenCalled();
  });

  it('wraps a DB failure as 500 INTERNAL_ERROR', async () => {
    prisma.students.findUnique.mockResolvedValue({ id: 8 });
    prisma.student_hostel_mapping.findUnique.mockResolvedValue({
      hostel_rooms: { room_number: 'A102' },
    });
    prisma.hostel_outings.create.mockRejectedValue(
      new Error('connection lost'),
    );

    await expect(
      service.createHostelOuting(103, {
        from_date: '2099-08-02',
        to_date: '2099-08-02',
        start_time: '09:00',
      }),
    ).rejects.toMatchObject({
      status: 500,
      response: { errorCode: 'INTERNAL_ERROR' },
    });
  });
});
