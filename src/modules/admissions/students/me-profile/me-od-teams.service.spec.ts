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
    $transaction: jest.Mock;
  };

  beforeEach(async () => {
    tx = {
      od_teams: { create: jest.fn() },
      od_team_members: { create: jest.fn() },
    };
    prisma = {
      students: { findUnique: jest.fn() },
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
});
