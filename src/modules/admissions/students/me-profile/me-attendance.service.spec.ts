import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { MeAttendanceService } from './me-attendance.service';

describe('MeAttendanceService', () => {
  let service: MeAttendanceService;
  let prisma: {
    students: { findUnique: jest.Mock };
    subjects: { findUnique: jest.Mock };
    attendance_records: { findMany: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      students: { findUnique: jest.fn() },
      subjects: { findUnique: jest.fn() },
      attendance_records: { findMany: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MeAttendanceService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<MeAttendanceService>(MeAttendanceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('throws 400 VALIDATION_ERROR when from is after to', async () => {
    await expect(
      service.getMyAttendance(1, { from: '2026-08-01', to: '2026-07-01' }),
    ).rejects.toMatchObject({
      status: 400,
      response: {
        errorCode: 'VALIDATION_ERROR',
        message:
          'from and to are required and from must be before or equal to to',
      },
    });
  });

  it('throws 404 STUDENT_NOT_FOUND when the JWT user has no linked student record', async () => {
    prisma.students.findUnique.mockResolvedValue(null);

    await expect(
      service.getMyAttendance(999, { from: '2026-07-01', to: '2026-07-31' }),
    ).rejects.toMatchObject({
      status: 404,
      response: { errorCode: 'STUDENT_NOT_FOUND' },
    });
  });

  it('throws 404 SUBJECT_NOT_FOUND when subject_id does not exist', async () => {
    prisma.students.findUnique.mockResolvedValue({ id: 42 });
    prisma.subjects.findUnique.mockResolvedValue(null);

    await expect(
      service.getMyAttendance(1, {
        from: '2026-07-01',
        to: '2026-07-31',
        subject_id: 999,
      }),
    ).rejects.toMatchObject({
      status: 404,
      response: { errorCode: 'SUBJECT_NOT_FOUND' },
    });
    expect(prisma.attendance_records.findMany).not.toHaveBeenCalled();
  });

  it('aggregates overall + per-subject percentages, excluding null-subject rows from by_subject', async () => {
    prisma.students.findUnique.mockResolvedValue({ id: 42 });
    prisma.attendance_records.findMany.mockResolvedValue([
      {
        attendance_date: new Date('2026-07-20T00:00:00.000Z'),
        subject_id: 14,
        status: 'present',
        subjects: { name: 'Data Structures' },
      },
      {
        attendance_date: new Date('2026-07-21T00:00:00.000Z'),
        subject_id: 14,
        status: 'absent',
        subjects: { name: 'Data Structures' },
      },
      {
        attendance_date: new Date('2026-07-22T00:00:00.000Z'),
        subject_id: null,
        status: 'absent',
        subjects: null,
      },
    ]);

    const result = await service.getMyAttendance(1, {
      from: '2026-07-01',
      to: '2026-07-31',
    });

    const [findManyArgs] = prisma.attendance_records.findMany.mock.calls[0] as [
      { where: Record<string, unknown> },
    ];
    expect(findManyArgs.where).toMatchObject({ student_id: 42 });
    expect(result.overall).toEqual({
      total_days: 3,
      present: 1,
      absent: 2,
      percentage: 33.33,
    });
    expect(result.by_subject).toEqual([
      {
        subject_id: 14,
        subject_name: 'Data Structures',
        total: 2,
        present: 1,
        percentage: 50,
      },
    ]);
    expect(result.records).toEqual([
      { attendance_date: '2026-07-20', subject_id: 14, status: 'present' },
      { attendance_date: '2026-07-21', subject_id: 14, status: 'absent' },
      { attendance_date: '2026-07-22', subject_id: null, status: 'absent' },
    ]);
  });

  it('returns zeroed overall (not NaN) for an empty result set', async () => {
    prisma.students.findUnique.mockResolvedValue({ id: 42 });
    prisma.attendance_records.findMany.mockResolvedValue([]);

    const result = await service.getMyAttendance(1, {
      from: '2020-01-01',
      to: '2020-01-31',
    });

    expect(result.overall).toEqual({
      total_days: 0,
      present: 0,
      absent: 0,
      percentage: 0,
    });
    expect(result.by_subject).toEqual([]);
    expect(result.records).toEqual([]);
  });

  it('passes subject_id through to the query when provided', async () => {
    prisma.students.findUnique.mockResolvedValue({ id: 42 });
    prisma.subjects.findUnique.mockResolvedValue({ id: 14 });
    prisma.attendance_records.findMany.mockResolvedValue([]);

    await service.getMyAttendance(1, {
      from: '2026-07-01',
      to: '2026-07-31',
      subject_id: 14,
    });

    const [findManyArgs] = prisma.attendance_records.findMany.mock.calls[0] as [
      { where: Record<string, unknown> },
    ];
    expect(findManyArgs.where).toMatchObject({ subject_id: 14 });
  });

  it('wraps a DB failure as 500 INTERNAL_ERROR', async () => {
    prisma.students.findUnique.mockResolvedValue({ id: 42 });
    prisma.attendance_records.findMany.mockRejectedValue(
      new Error('connection lost'),
    );

    await expect(
      service.getMyAttendance(1, { from: '2026-07-01', to: '2026-07-31' }),
    ).rejects.toMatchObject({
      status: 500,
      response: { errorCode: 'INTERNAL_ERROR' },
    });
  });
});
