import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { MeBonafideRequestsService } from './me-bonafide-requests.service';

describe('MeBonafideRequestsService', () => {
  let service: MeBonafideRequestsService;
  let prisma: {
    students: { findUnique: jest.Mock };
    bonafide_reasons: { findUnique: jest.Mock };
    bonafide_requests: {
      create: jest.Mock;
      count: jest.Mock;
      findMany: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      students: { findUnique: jest.fn() },
      bonafide_reasons: { findUnique: jest.fn() },
      bonafide_requests: {
        create: jest.fn(),
        count: jest.fn(),
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MeBonafideRequestsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<MeBonafideRequestsService>(MeBonafideRequestsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('creates a pending bonafide request scoped to the resolved student_id, enriched with reason_text', async () => {
    prisma.students.findUnique.mockResolvedValue({ id: 8 });
    prisma.bonafide_reasons.findUnique.mockResolvedValue({
      id: 3,
      reason_text: 'For Bank Loan',
    });
    prisma.bonafide_requests.create.mockResolvedValue({
      id: 214,
      student_id: 8,
      reason_id: 3,
      status: 'pending',
      requested_at: new Date('2026-07-26T10:00:00.000Z'),
      issued_at: null,
      file_url: null,
    });

    const result = await service.createBonafideRequest(103, { reason_id: 3 });

    expect(prisma.students.findUnique).toHaveBeenCalledWith({
      where: { user_id: 103 },
      select: { id: true },
    });
    expect(prisma.bonafide_reasons.findUnique).toHaveBeenCalledWith({
      where: { id: 3 },
      select: { id: true, reason_text: true },
    });
    const [createArgs] = prisma.bonafide_requests.create.mock.calls[0] as [
      { data: Record<string, unknown> },
    ];
    expect(createArgs.data).toEqual({
      student_id: 8,
      reason_id: 3,
      status: 'pending',
    });
    expect(result).toEqual({
      id: 214,
      student_id: 8,
      reason_id: 3,
      reason_text: 'For Bank Loan',
      status: 'pending',
      requested_at: '2026-07-26T10:00:00.000Z',
      issued_at: null,
      file_url: null,
    });
  });

  it('allows a second pending request for the same reason (duplicate check deliberately not implemented)', async () => {
    prisma.students.findUnique.mockResolvedValue({ id: 8 });
    prisma.bonafide_reasons.findUnique.mockResolvedValue({
      id: 3,
      reason_text: 'For Bank Loan',
    });
    prisma.bonafide_requests.create.mockResolvedValue({
      id: 215,
      student_id: 8,
      reason_id: 3,
      status: 'pending',
      requested_at: new Date(),
      issued_at: null,
      file_url: null,
    });

    await expect(
      service.createBonafideRequest(103, { reason_id: 3 }),
    ).resolves.toBeDefined();
    expect(prisma.bonafide_requests.create).toHaveBeenCalledTimes(1);
  });

  it('throws 404 STUDENT_NOT_FOUND when the JWT user has no linked student record', async () => {
    prisma.students.findUnique.mockResolvedValue(null);

    await expect(
      service.createBonafideRequest(999, { reason_id: 3 }),
    ).rejects.toMatchObject({
      status: 404,
      response: { errorCode: 'STUDENT_NOT_FOUND' },
    });
    expect(prisma.bonafide_reasons.findUnique).not.toHaveBeenCalled();
  });

  it('throws 404 REASON_NOT_FOUND when reason_id matches no bonafide_reasons row', async () => {
    prisma.students.findUnique.mockResolvedValue({ id: 8 });
    prisma.bonafide_reasons.findUnique.mockResolvedValue(null);

    await expect(
      service.createBonafideRequest(103, { reason_id: 999 }),
    ).rejects.toMatchObject({
      status: 404,
      response: { errorCode: 'REASON_NOT_FOUND' },
    });
    expect(prisma.bonafide_requests.create).not.toHaveBeenCalled();
  });

  it('wraps a DB failure on insert as 500 INTERNAL_ERROR', async () => {
    prisma.students.findUnique.mockResolvedValue({ id: 8 });
    prisma.bonafide_reasons.findUnique.mockResolvedValue({
      id: 3,
      reason_text: 'For Bank Loan',
    });
    prisma.bonafide_requests.create.mockRejectedValue(
      new Error('connection lost'),
    );

    await expect(
      service.createBonafideRequest(103, { reason_id: 3 }),
    ).rejects.toMatchObject({
      status: 500,
      response: { errorCode: 'INTERNAL_ERROR' },
    });
  });

  it('wraps a DB failure on the reason lookup as 500 INTERNAL_ERROR (e.g. an int4-overflow-class failure that slips past DTO validation)', async () => {
    prisma.students.findUnique.mockResolvedValue({ id: 8 });
    prisma.bonafide_reasons.findUnique.mockRejectedValue(
      new Error('numeric field overflow'),
    );

    await expect(
      service.createBonafideRequest(103, { reason_id: 3 }),
    ).rejects.toMatchObject({
      status: 500,
      response: { errorCode: 'INTERNAL_ERROR' },
    });
    expect(prisma.bonafide_requests.create).not.toHaveBeenCalled();
  });

  describe('getMyBonafideRequests', () => {
    it('resolves reason_text for every row and handles nulls', async () => {
      prisma.students.findUnique.mockResolvedValue({ id: 8 });
      prisma.bonafide_requests.count.mockResolvedValue(2);
      prisma.bonafide_requests.findMany.mockResolvedValue([
        {
          id: 2,
          reason_id: 2,
          status: 'pending',
          requested_at: new Date('2026-07-29T14:07:11.155Z'),
          issued_at: null,
          file_url: null,
          bonafide_reasons: { reason_text: 'For Passport Application' },
        },
        {
          id: 1,
          reason_id: 1,
          status: 'issued',
          requested_at: new Date('2026-07-26T10:00:00.000Z'),
          issued_at: new Date('2026-07-27T09:15:00.000Z'),
          file_url: 'https://storage.example.com/bonafide/214.pdf',
          bonafide_reasons: { reason_text: 'For Bank Loan' },
        },
      ]);

      const result = await service.getMyBonafideRequests(103, {});

      expect(prisma.students.findUnique).toHaveBeenCalledWith({
        where: { user_id: 103 },
        select: { id: true },
      });
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.page_size).toBe(20);
      expect(result.data[0]).toEqual({
        id: 2,
        reason_id: 2,
        reason_text: 'For Passport Application',
        status: 'pending',
        requested_at: '2026-07-29T14:07:11.155Z',
        issued_at: null,
        file_url: null,
      });
      expect(result.data[1]).toEqual({
        id: 1,
        reason_id: 1,
        reason_text: 'For Bank Loan',
        status: 'issued',
        requested_at: '2026-07-26T10:00:00.000Z',
        issued_at: '2026-07-27T09:15:00.000Z',
        file_url: 'https://storage.example.com/bonafide/214.pdf',
      });
    });

    it('filters by status when provided', async () => {
      prisma.students.findUnique.mockResolvedValue({ id: 8 });
      prisma.bonafide_requests.count.mockResolvedValue(0);
      prisma.bonafide_requests.findMany.mockResolvedValue([]);

      await service.getMyBonafideRequests(103, { status: 'issued' });

      const [countArgs] = prisma.bonafide_requests.count.mock.calls[0] as [
        { where: Record<string, unknown> },
      ];
      expect(countArgs.where).toEqual({ student_id: 8, status: 'issued' });
    });

    it('applies pagination (page/page_size -> skip/take)', async () => {
      prisma.students.findUnique.mockResolvedValue({ id: 8 });
      prisma.bonafide_requests.count.mockResolvedValue(50);
      prisma.bonafide_requests.findMany.mockResolvedValue([]);

      await service.getMyBonafideRequests(103, { page: 3, page_size: 10 });

      const [findManyArgs] = prisma.bonafide_requests.findMany.mock
        .calls[0] as [{ skip: number; take: number }];
      expect(findManyArgs.skip).toBe(20);
      expect(findManyArgs.take).toBe(10);
    });

    it('returns an empty list (not an error) when the student has no bonafide requests', async () => {
      prisma.students.findUnique.mockResolvedValue({ id: 8 });
      prisma.bonafide_requests.count.mockResolvedValue(0);
      prisma.bonafide_requests.findMany.mockResolvedValue([]);

      const result = await service.getMyBonafideRequests(103, {});

      expect(result).toEqual({ data: [], page: 1, page_size: 20, total: 0 });
    });

    it('throws 404 STUDENT_NOT_FOUND when the JWT user has no linked student record', async () => {
      prisma.students.findUnique.mockResolvedValue(null);

      await expect(
        service.getMyBonafideRequests(999, {}),
      ).rejects.toMatchObject({
        status: 404,
        response: { errorCode: 'STUDENT_NOT_FOUND' },
      });
    });

    it('wraps a DB failure as 500 INTERNAL_ERROR', async () => {
      prisma.students.findUnique.mockResolvedValue({ id: 8 });
      prisma.bonafide_requests.count.mockRejectedValue(
        new Error('connection lost'),
      );

      await expect(
        service.getMyBonafideRequests(103, {}),
      ).rejects.toMatchObject({
        status: 500,
        response: { errorCode: 'INTERNAL_ERROR' },
      });
    });
  });
});
