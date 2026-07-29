import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { MeOdTeamsService } from './me-od-teams.service';

const CODE_ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

describe('MeOdTeamsService', () => {
  let service: MeOdTeamsService;
  let tx: {
    od_teams: { create: jest.Mock };
    od_team_members: { create: jest.Mock };
  };
  let prisma: {
    students: { findUnique: jest.Mock };
    od_teams: { findUnique: jest.Mock };
    od_team_members: {
      findUnique: jest.Mock;
      create: jest.Mock;
      delete: jest.Mock;
    };
    $transaction: jest.Mock;
  };

  beforeEach(async () => {
    tx = {
      od_teams: { create: jest.fn() },
      od_team_members: { create: jest.fn() },
    };
    prisma = {
      students: { findUnique: jest.fn() },
      od_teams: { findUnique: jest.fn() },
      od_team_members: {
        findUnique: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
      },
      $transaction: jest.fn((cb: (tx: unknown) => unknown) => cb(tx)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MeOdTeamsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<MeOdTeamsService>(MeOdTeamsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('creates a team and auto-joins the creator as its first member, in one transaction', async () => {
    prisma.students.findUnique.mockResolvedValue({ id: 3310 });
    tx.od_teams.create.mockResolvedValue({
      id: 61,
      created_by_student_id: 3310,
      unique_code: 'X7K9QT',
      is_locked: false,
      created_at: new Date('2026-07-26T10:15:00.000Z'),
    });
    tx.od_team_members.create.mockResolvedValue({
      id: 1,
      team_id: 61,
      student_id: 3310,
    });

    const result = await service.createOdTeam(7);

    expect(prisma.students.findUnique).toHaveBeenCalledWith({
      where: { user_id: 7 },
      select: { id: true },
    });

    const [teamCreateArgs] = tx.od_teams.create.mock.calls[0] as [
      {
        data: {
          created_by_student_id: number;
          unique_code: string;
          is_locked: boolean;
        };
      },
    ];
    expect(teamCreateArgs.data.created_by_student_id).toBe(3310);
    expect(teamCreateArgs.data.is_locked).toBe(false);
    expect(teamCreateArgs.data.unique_code).toHaveLength(6);
    for (const char of teamCreateArgs.data.unique_code) {
      expect(CODE_ALPHABET).toContain(char);
    }

    const [memberCreateArgs] = tx.od_team_members.create.mock.calls[0] as [
      { data: { team_id: number; student_id: number } },
    ];
    expect(memberCreateArgs.data).toEqual({ team_id: 61, student_id: 3310 });

    expect(result).toEqual({
      id: 61,
      created_by_student_id: 3310,
      unique_code: 'X7K9QT',
      is_locked: false,
      created_at: new Date('2026-07-26T10:15:00.000Z'),
    });
  });

  it('throws 404 STUDENT_NOT_FOUND when the JWT user has no linked student record', async () => {
    prisma.students.findUnique.mockResolvedValue(null);

    await expect(service.createOdTeam(999)).rejects.toMatchObject({
      status: 404,
      response: { errorCode: 'STUDENT_NOT_FOUND' },
    });
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('retries with a freshly generated unique_code on a P2002 collision', async () => {
    prisma.students.findUnique.mockResolvedValue({ id: 3310 });
    const conflict = Object.assign(new Error('Unique constraint failed'), {
      code: 'P2002',
    });
    prisma.$transaction
      .mockImplementationOnce(() => Promise.reject(conflict))
      .mockImplementationOnce((cb: (tx: unknown) => unknown) => cb(tx));
    tx.od_teams.create.mockResolvedValue({
      id: 62,
      created_by_student_id: 3310,
      unique_code: 'ABCDEF',
      is_locked: false,
      created_at: new Date(),
    });
    tx.od_team_members.create.mockResolvedValue({});

    const result = await service.createOdTeam(7);

    expect(prisma.$transaction).toHaveBeenCalledTimes(2);
    expect(result.id).toBe(62);
  });

  it('gives up and throws 500 INTERNAL_ERROR after exhausting all retry attempts on repeated collisions', async () => {
    prisma.students.findUnique.mockResolvedValue({ id: 3310 });
    const conflict = Object.assign(new Error('Unique constraint failed'), {
      code: 'P2002',
    });
    prisma.$transaction.mockImplementation(() => Promise.reject(conflict));

    await expect(service.createOdTeam(7)).rejects.toMatchObject({
      status: 500,
      response: { errorCode: 'INTERNAL_ERROR' },
    });
    expect(prisma.$transaction).toHaveBeenCalledTimes(5);
  });

  it('wraps a non-collision DB failure as 500 INTERNAL_ERROR without retrying', async () => {
    prisma.students.findUnique.mockResolvedValue({ id: 3310 });
    prisma.$transaction.mockRejectedValue(new Error('connection lost'));

    await expect(service.createOdTeam(7)).rejects.toMatchObject({
      status: 500,
      response: { errorCode: 'INTERNAL_ERROR' },
    });
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
  });

  describe('joinOdTeam', () => {
    it('joins an unlocked team and returns an enriched, nested response', async () => {
      prisma.students.findUnique.mockResolvedValue({ id: 8 });
      prisma.od_teams.findUnique.mockResolvedValue({
        id: 61,
        unique_code: 'X7K9QT',
        is_locked: false,
      });
      prisma.od_team_members.findUnique.mockResolvedValue(null);
      prisma.od_team_members.create.mockResolvedValue({
        id: 145,
        team_id: 61,
        student_id: 8,
        joined_at: new Date('2026-07-26T10:20:00.000Z'),
      });

      const result = await service.joinOdTeam(103, { unique_code: 'X7K9QT' });

      expect(prisma.od_teams.findUnique).toHaveBeenCalledWith({
        where: { unique_code: 'X7K9QT' },
        select: { id: true, unique_code: true, is_locked: true },
      });
      expect(prisma.od_team_members.findUnique).toHaveBeenCalledWith({
        where: { team_id_student_id: { team_id: 61, student_id: 8 } },
      });
      expect(prisma.od_team_members.create).toHaveBeenCalledWith({
        data: { team_id: 61, student_id: 8 },
      });
      expect(result).toEqual({
        id: 145,
        team_id: 61,
        student_id: 8,
        joined_at: new Date('2026-07-26T10:20:00.000Z'),
        team: { unique_code: 'X7K9QT', is_locked: false },
      });
    });

    it('throws 404 STUDENT_NOT_FOUND when the JWT user has no linked student record', async () => {
      prisma.students.findUnique.mockResolvedValue(null);

      await expect(
        service.joinOdTeam(999, { unique_code: 'X7K9QT' }),
      ).rejects.toMatchObject({
        status: 404,
        response: { errorCode: 'STUDENT_NOT_FOUND' },
      });
      expect(prisma.od_teams.findUnique).not.toHaveBeenCalled();
    });

    it('throws 404 TEAM_NOT_FOUND when unique_code matches no team', async () => {
      prisma.students.findUnique.mockResolvedValue({ id: 8 });
      prisma.od_teams.findUnique.mockResolvedValue(null);

      await expect(
        service.joinOdTeam(103, { unique_code: 'NOTREAL' }),
      ).rejects.toMatchObject({
        status: 404,
        response: { errorCode: 'TEAM_NOT_FOUND' },
      });
      expect(prisma.od_team_members.findUnique).not.toHaveBeenCalled();
    });

    it('throws 422 TEAM_LOCKED when the team is locked', async () => {
      prisma.students.findUnique.mockResolvedValue({ id: 8 });
      prisma.od_teams.findUnique.mockResolvedValue({
        id: 61,
        unique_code: 'X7K9QT',
        is_locked: true,
      });

      await expect(
        service.joinOdTeam(103, { unique_code: 'X7K9QT' }),
      ).rejects.toMatchObject({
        status: 422,
        response: { errorCode: 'TEAM_LOCKED' },
      });
      expect(prisma.od_team_members.findUnique).not.toHaveBeenCalled();
      expect(prisma.od_team_members.create).not.toHaveBeenCalled();
    });

    it('throws 409 ALREADY_A_MEMBER via the pre-check when already a member', async () => {
      prisma.students.findUnique.mockResolvedValue({ id: 8 });
      prisma.od_teams.findUnique.mockResolvedValue({
        id: 61,
        unique_code: 'X7K9QT',
        is_locked: false,
      });
      prisma.od_team_members.findUnique.mockResolvedValue({
        id: 90,
        team_id: 61,
        student_id: 8,
      });

      await expect(
        service.joinOdTeam(103, { unique_code: 'X7K9QT' }),
      ).rejects.toMatchObject({
        status: 409,
        response: { errorCode: 'ALREADY_A_MEMBER' },
      });
      expect(prisma.od_team_members.create).not.toHaveBeenCalled();
    });

    it('throws 409 ALREADY_A_MEMBER via the P2002 backstop when a race slips past the pre-check', async () => {
      prisma.students.findUnique.mockResolvedValue({ id: 8 });
      prisma.od_teams.findUnique.mockResolvedValue({
        id: 61,
        unique_code: 'X7K9QT',
        is_locked: false,
      });
      prisma.od_team_members.findUnique.mockResolvedValue(null);
      const conflict = Object.assign(new Error('Unique constraint failed'), {
        code: 'P2002',
      });
      prisma.od_team_members.create.mockRejectedValue(conflict);

      await expect(
        service.joinOdTeam(103, { unique_code: 'X7K9QT' }),
      ).rejects.toMatchObject({
        status: 409,
        response: { errorCode: 'ALREADY_A_MEMBER' },
      });
    });

    it('wraps a non-collision DB failure on insert as 500 INTERNAL_ERROR', async () => {
      prisma.students.findUnique.mockResolvedValue({ id: 8 });
      prisma.od_teams.findUnique.mockResolvedValue({
        id: 61,
        unique_code: 'X7K9QT',
        is_locked: false,
      });
      prisma.od_team_members.findUnique.mockResolvedValue(null);
      prisma.od_team_members.create.mockRejectedValue(
        new Error('connection lost'),
      );

      await expect(
        service.joinOdTeam(103, { unique_code: 'X7K9QT' }),
      ).rejects.toMatchObject({
        status: 500,
        response: { errorCode: 'INTERNAL_ERROR' },
      });
    });
  });

  describe('removeOdTeamMember', () => {
    it('creator removes another member and gets an enriched confirmation', async () => {
      prisma.students.findUnique.mockResolvedValue({ id: 7 });
      prisma.od_teams.findUnique.mockResolvedValue({
        id: 61,
        created_by_student_id: 7,
      });
      const joinedAt = new Date('2026-07-26T10:20:00.000Z');
      prisma.od_team_members.findUnique.mockResolvedValue({
        id: 145,
        team_id: 61,
        student_id: 8,
        joined_at: joinedAt,
      });
      prisma.od_team_members.delete.mockResolvedValue({});

      const result = await service.removeOdTeamMember(103, 61, 8);

      expect(prisma.od_teams.findUnique).toHaveBeenCalledWith({
        where: { id: 61 },
        select: { id: true, created_by_student_id: true },
      });
      expect(prisma.od_team_members.findUnique).toHaveBeenCalledWith({
        where: { team_id_student_id: { team_id: 61, student_id: 8 } },
      });
      expect(prisma.od_team_members.delete).toHaveBeenCalledWith({
        where: { id: 145 },
      });
      expect(result.team_id).toBe(61);
      expect(result.student_id).toBe(8);
      expect(result.joined_at).toEqual(joinedAt);
      expect(result.removed_at).toBeInstanceOf(Date);
    });

    it('member removes themselves (not the creator)', async () => {
      prisma.students.findUnique.mockResolvedValue({ id: 8 });
      prisma.od_teams.findUnique.mockResolvedValue({
        id: 61,
        created_by_student_id: 7,
      });
      prisma.od_team_members.findUnique.mockResolvedValue({
        id: 145,
        team_id: 61,
        student_id: 8,
        joined_at: new Date(),
      });
      prisma.od_team_members.delete.mockResolvedValue({});

      const result = await service.removeOdTeamMember(999, 61, 8);

      expect(result.student_id).toBe(8);
      expect(prisma.od_team_members.delete).toHaveBeenCalledWith({
        where: { id: 145 },
      });
    });

    it('throws 404 STUDENT_NOT_FOUND when the JWT user has no linked student record', async () => {
      prisma.students.findUnique.mockResolvedValue(null);

      await expect(
        service.removeOdTeamMember(999, 61, 8),
      ).rejects.toMatchObject({
        status: 404,
        response: { errorCode: 'STUDENT_NOT_FOUND' },
      });
      expect(prisma.od_teams.findUnique).not.toHaveBeenCalled();
    });

    it('throws 404 TEAM_NOT_FOUND when id matches no team', async () => {
      prisma.students.findUnique.mockResolvedValue({ id: 7 });
      prisma.od_teams.findUnique.mockResolvedValue(null);

      await expect(
        service.removeOdTeamMember(103, 999, 8),
      ).rejects.toMatchObject({
        status: 404,
        response: { errorCode: 'TEAM_NOT_FOUND' },
      });
      expect(prisma.od_team_members.findUnique).not.toHaveBeenCalled();
    });

    it('throws 403 NOT_AUTHORIZED_TO_REMOVE when caller is neither creator nor target', async () => {
      prisma.students.findUnique.mockResolvedValue({ id: 9 });
      prisma.od_teams.findUnique.mockResolvedValue({
        id: 61,
        created_by_student_id: 7,
      });

      await expect(
        service.removeOdTeamMember(555, 61, 8),
      ).rejects.toMatchObject({
        status: 403,
        response: { errorCode: 'NOT_AUTHORIZED_TO_REMOVE' },
      });
      expect(prisma.od_team_members.findUnique).not.toHaveBeenCalled();
    });

    it('throws 404 MEMBER_NOT_FOUND via the pre-check when the target never joined', async () => {
      prisma.students.findUnique.mockResolvedValue({ id: 7 });
      prisma.od_teams.findUnique.mockResolvedValue({
        id: 61,
        created_by_student_id: 7,
      });
      prisma.od_team_members.findUnique.mockResolvedValue(null);

      await expect(
        service.removeOdTeamMember(103, 61, 999),
      ).rejects.toMatchObject({
        status: 404,
        response: { errorCode: 'MEMBER_NOT_FOUND' },
      });
      expect(prisma.od_team_members.delete).not.toHaveBeenCalled();
    });

    it('throws 404 MEMBER_NOT_FOUND via the P2025 backstop when the row disappears before delete', async () => {
      prisma.students.findUnique.mockResolvedValue({ id: 7 });
      prisma.od_teams.findUnique.mockResolvedValue({
        id: 61,
        created_by_student_id: 7,
      });
      prisma.od_team_members.findUnique.mockResolvedValue({
        id: 145,
        team_id: 61,
        student_id: 8,
        joined_at: new Date(),
      });
      const notFound = Object.assign(new Error('Record not found'), {
        code: 'P2025',
      });
      prisma.od_team_members.delete.mockRejectedValue(notFound);

      await expect(
        service.removeOdTeamMember(103, 61, 8),
      ).rejects.toMatchObject({
        status: 404,
        response: { errorCode: 'MEMBER_NOT_FOUND' },
      });
    });

    it('wraps a non-P2025 DB failure on delete as 500 INTERNAL_ERROR', async () => {
      prisma.students.findUnique.mockResolvedValue({ id: 7 });
      prisma.od_teams.findUnique.mockResolvedValue({
        id: 61,
        created_by_student_id: 7,
      });
      prisma.od_team_members.findUnique.mockResolvedValue({
        id: 145,
        team_id: 61,
        student_id: 8,
        joined_at: new Date(),
      });
      prisma.od_team_members.delete.mockRejectedValue(
        new Error('connection lost'),
      );

      await expect(
        service.removeOdTeamMember(103, 61, 8),
      ).rejects.toMatchObject({
        status: 500,
        response: { errorCode: 'INTERNAL_ERROR' },
      });
    });
  });
});
