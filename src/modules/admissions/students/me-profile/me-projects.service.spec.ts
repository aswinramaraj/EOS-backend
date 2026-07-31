import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { MeProjectsService } from './me-projects.service';

describe('MeProjectsService', () => {
  let service: MeProjectsService;
  let prisma: {
    students: { findUnique: jest.Mock };
    faculty: { findUnique: jest.Mock };
    student_projects: {
      create: jest.Mock;
      count: jest.Mock;
      findMany: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      students: { findUnique: jest.fn() },
      faculty: { findUnique: jest.fn() },
      student_projects: {
        create: jest.fn(),
        count: jest.fn(),
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MeProjectsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<MeProjectsService>(MeProjectsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createProject', () => {
    it('creates a project with a mentor, enriched with mentor_faculty_name', async () => {
      prisma.students.findUnique.mockResolvedValue({ id: 8 });
      prisma.faculty.findUnique.mockResolvedValue({
        first_name: 'Priya',
        last_name: 'Jayaraman',
      });
      prisma.student_projects.create.mockResolvedValue({
        id: 210,
        title: 'Real-Time OD Attendance Tracker',
        description: 'A full-stack app.',
        mentor_faculty_id: 5,
      });

      const result = await service.createProject(103, {
        title: 'Real-Time OD Attendance Tracker',
        description: 'A full-stack app.',
        mentor_faculty_id: 5,
      });

      expect(prisma.faculty.findUnique).toHaveBeenCalledWith({
        where: { id: 5 },
        select: { first_name: true, last_name: true },
      });
      const [createArgs] = prisma.student_projects.create.mock.calls[0] as [
        { data: Record<string, unknown> },
      ];
      expect(createArgs.data).toEqual({
        student_id: 8,
        title: 'Real-Time OD Attendance Tracker',
        description: 'A full-stack app.',
        mentor_faculty_id: 5,
      });
      expect(result).toEqual({
        id: 210,
        title: 'Real-Time OD Attendance Tracker',
        description: 'A full-stack app.',
        mentor_faculty_id: 5,
        mentor_faculty_name: 'Priya Jayaraman',
      });
    });

    it('creates a project with no mentor, mentor_faculty_name stays null', async () => {
      prisma.students.findUnique.mockResolvedValue({ id: 8 });
      prisma.student_projects.create.mockResolvedValue({
        id: 211,
        title: 'Library Fine Calculator',
        description: null,
        mentor_faculty_id: null,
      });

      const result = await service.createProject(103, {
        title: 'Library Fine Calculator',
      });

      expect(prisma.faculty.findUnique).not.toHaveBeenCalled();
      expect(result.mentor_faculty_name).toBeNull();
      expect(result.mentor_faculty_id).toBeNull();
    });

    it('throws 404 STUDENT_NOT_FOUND when the JWT user has no linked student record', async () => {
      prisma.students.findUnique.mockResolvedValue(null);

      await expect(
        service.createProject(999, { title: 'X' }),
      ).rejects.toMatchObject({
        status: 404,
        response: { errorCode: 'STUDENT_NOT_FOUND' },
      });
      expect(prisma.faculty.findUnique).not.toHaveBeenCalled();
    });

    it('throws 404 FACULTY_NOT_FOUND when mentor_faculty_id matches no faculty row', async () => {
      prisma.students.findUnique.mockResolvedValue({ id: 8 });
      prisma.faculty.findUnique.mockResolvedValue(null);

      await expect(
        service.createProject(103, { title: 'X', mentor_faculty_id: 999 }),
      ).rejects.toMatchObject({
        status: 404,
        response: { errorCode: 'FACULTY_NOT_FOUND' },
      });
      expect(prisma.student_projects.create).not.toHaveBeenCalled();
    });

    it('wraps a DB failure on insert as 500 INTERNAL_ERROR', async () => {
      prisma.students.findUnique.mockResolvedValue({ id: 8 });
      prisma.student_projects.create.mockRejectedValue(
        new Error('connection lost'),
      );

      await expect(
        service.createProject(103, { title: 'X' }),
      ).rejects.toMatchObject({
        status: 500,
        response: { errorCode: 'INTERNAL_ERROR' },
      });
    });

    it('wraps a DB failure on the mentor lookup as 500 INTERNAL_ERROR', async () => {
      prisma.students.findUnique.mockResolvedValue({ id: 8 });
      prisma.faculty.findUnique.mockRejectedValue(
        new Error('numeric field overflow'),
      );

      await expect(
        service.createProject(103, { title: 'X', mentor_faculty_id: 5 }),
      ).rejects.toMatchObject({
        status: 500,
        response: { errorCode: 'INTERNAL_ERROR' },
      });
      expect(prisma.student_projects.create).not.toHaveBeenCalled();
    });
  });

  describe('getMyProjects', () => {
    it('resolves mentor_faculty_name for every row and handles nulls', async () => {
      prisma.students.findUnique.mockResolvedValue({ id: 8 });
      prisma.student_projects.count.mockResolvedValue(2);
      prisma.student_projects.findMany.mockResolvedValue([
        {
          id: 211,
          title: 'Library Fine Calculator',
          description: null,
          mentor_faculty_id: null,
          faculty: null,
        },
        {
          id: 210,
          title: 'Real-Time OD Attendance Tracker',
          description: 'A full-stack app.',
          mentor_faculty_id: 5,
          faculty: { first_name: 'Priya', last_name: 'Jayaraman' },
        },
      ]);

      const result = await service.getMyProjects(103, {});

      expect(prisma.students.findUnique).toHaveBeenCalledWith({
        where: { user_id: 103 },
        select: { id: true },
      });
      expect(result.total).toBe(2);
      expect(result.data[0]).toEqual({
        id: 211,
        title: 'Library Fine Calculator',
        description: null,
        mentor_faculty_id: null,
        mentor_faculty_name: null,
      });
      expect(result.data[1]).toEqual({
        id: 210,
        title: 'Real-Time OD Attendance Tracker',
        description: 'A full-stack app.',
        mentor_faculty_id: 5,
        mentor_faculty_name: 'Priya Jayaraman',
      });
    });

    it('orders by id desc', async () => {
      prisma.students.findUnique.mockResolvedValue({ id: 8 });
      prisma.student_projects.count.mockResolvedValue(0);
      prisma.student_projects.findMany.mockResolvedValue([]);

      await service.getMyProjects(103, {});

      const [findManyArgs] = prisma.student_projects.findMany.mock.calls[0] as [
        { orderBy: Record<string, unknown> },
      ];
      expect(findManyArgs.orderBy).toEqual({ id: 'desc' });
    });

    it('applies pagination (page/page_size -> skip/take)', async () => {
      prisma.students.findUnique.mockResolvedValue({ id: 8 });
      prisma.student_projects.count.mockResolvedValue(50);
      prisma.student_projects.findMany.mockResolvedValue([]);

      await service.getMyProjects(103, { page: 3, page_size: 10 });

      const [findManyArgs] = prisma.student_projects.findMany.mock.calls[0] as [
        { skip: number; take: number },
      ];
      expect(findManyArgs.skip).toBe(20);
      expect(findManyArgs.take).toBe(10);
    });

    it('returns an empty list (not an error) when the student has no projects', async () => {
      prisma.students.findUnique.mockResolvedValue({ id: 8 });
      prisma.student_projects.count.mockResolvedValue(0);
      prisma.student_projects.findMany.mockResolvedValue([]);

      const result = await service.getMyProjects(103, {});

      expect(result).toEqual({ data: [], page: 1, page_size: 20, total: 0 });
    });

    it('throws 404 STUDENT_NOT_FOUND when the JWT user has no linked student record', async () => {
      prisma.students.findUnique.mockResolvedValue(null);

      await expect(service.getMyProjects(999, {})).rejects.toMatchObject({
        status: 404,
        response: { errorCode: 'STUDENT_NOT_FOUND' },
      });
    });

    it('wraps a DB failure as 500 INTERNAL_ERROR', async () => {
      prisma.students.findUnique.mockResolvedValue({ id: 8 });
      prisma.student_projects.count.mockRejectedValue(
        new Error('connection lost'),
      );

      await expect(service.getMyProjects(103, {})).rejects.toMatchObject({
        status: 500,
        response: { errorCode: 'INTERNAL_ERROR' },
      });
    });
  });
});
