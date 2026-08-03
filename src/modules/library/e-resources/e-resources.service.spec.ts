jest.mock('src/prisma/prisma.service', () => ({
  PrismaService: jest.fn(),
}));

import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { EResourcesService } from './e-resources.service';
import { PrismaService } from 'src/prisma/prisma.service';

describe('EResourcesService', () => {
  let service: EResourcesService;

  const mockPrismaService = {
    e_resources: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    book_categories: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn((ops: Promise<any>[]) => Promise.all(ops)),
    $queryRaw: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    mockPrismaService.$transaction.mockImplementation((ops: Promise<any>[]) =>
      Promise.all(ops),
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EResourcesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<EResourcesService>(EResourcesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto = {
      title: 'IEEE Xplore',
      url: 'https://ieeexplore.ieee.org',
      category_id: 1,
    };

    it('should create an e-resource successfully', async () => {
      mockPrismaService.book_categories.findUnique.mockResolvedValue({
        id: 1,
        name: 'Engineering',
      });
      mockPrismaService.e_resources.findFirst.mockResolvedValue(null);
      mockPrismaService.e_resources.create.mockResolvedValue({
        id: 10,
        title: 'IEEE Xplore',
        url: 'https://ieeexplore.ieee.org',
        category_id: 1,
        book_categories: { id: 1, name: 'Engineering' },
      });

      const result = await service.create(createDto, 99);

      expect(mockPrismaService.book_categories.findUnique).toHaveBeenCalledWith(
        { where: { id: 1 } },
      );
      expect(mockPrismaService.e_resources.findFirst).toHaveBeenCalledWith({
        where: {
          url: { equals: 'https://ieeexplore.ieee.org', mode: 'insensitive' },
        },
      });
      expect(mockPrismaService.e_resources.create).toHaveBeenCalledWith({
        data: {
          title: createDto.title,
          url: createDto.url,
          category_id: createDto.category_id,
          format: undefined,
          file_size_bytes: undefined,
          pages: undefined,
          license_type: undefined,
          concurrent_seats: undefined,
          publish_state: undefined,
          uploaded_by_user_id: 99,
        },
        include: {
          book_categories: { select: { id: true, name: true } },
        },
      });
      expect(result).toEqual({
        id: 10,
        title: 'IEEE Xplore',
        url: 'https://ieeexplore.ieee.org',
        category_id: 1,
        category_name: 'Engineering',
      });
    });

    it('should create an e-resource with no category', async () => {
      mockPrismaService.e_resources.findFirst.mockResolvedValue(null);
      mockPrismaService.e_resources.create.mockResolvedValue({
        id: 11,
        title: 'Open Access Journal',
        url: 'https://example.com',
        category_id: null,
        book_categories: null,
      });

      const result = await service.create(
        {
          title: 'Open Access Journal',
          url: 'https://example.com',
        },
        99,
      );

      expect(
        mockPrismaService.book_categories.findUnique,
      ).not.toHaveBeenCalled();
      expect(result.category_name).toBeNull();
    });

    it('should throw NotFoundException when category does not exist', async () => {
      mockPrismaService.book_categories.findUnique.mockResolvedValue(null);

      await expect(service.create(createDto, 99)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPrismaService.e_resources.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when the URL already exists', async () => {
      mockPrismaService.book_categories.findUnique.mockResolvedValue({
        id: 1,
        name: 'Engineering',
      });
      mockPrismaService.e_resources.findFirst.mockResolvedValue({
        id: 5,
        url: 'https://ieeexplore.ieee.org',
      });

      await expect(service.create(createDto, 99)).rejects.toThrow(
        ConflictException,
      );
      expect(mockPrismaService.e_resources.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return paginated e-resources with default filters', async () => {
      const resources = [
        {
          id: 1,
          title: 'JSTOR',
          url: 'https://jstor.org',
          category_id: 1,
          book_categories: { id: 1, name: 'Humanities' },
        },
      ];
      mockPrismaService.e_resources.findMany.mockResolvedValue(resources);
      mockPrismaService.e_resources.count.mockResolvedValue(1);

      const result = await service.findAll({});

      expect(mockPrismaService.$transaction).toHaveBeenCalled();
      expect(mockPrismaService.e_resources.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {},
          skip: 0,
          take: 20,
          orderBy: { title: 'asc' },
        }),
      );
      expect(result).toEqual({
        page: 1,
        page_size: 20,
        total: 1,
        data: [
          {
            id: 1,
            title: 'JSTOR',
            url: 'https://jstor.org',
            category_id: 1,
            category_name: 'Humanities',
          },
        ],
      });
    });

    it('should apply search query, category filter and pagination', async () => {
      mockPrismaService.e_resources.findMany.mockResolvedValue([]);
      mockPrismaService.e_resources.count.mockResolvedValue(0);

      await service.findAll({
        q: 'ieee',
        category_id: 3,
        page: 2,
        page_size: 10,
      });

      expect(mockPrismaService.e_resources.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            title: { contains: 'ieee', mode: 'insensitive' },
            category_id: 3,
          },
          skip: 10,
          take: 10,
        }),
      );
    });

    it('should return empty data set when no e-resources match', async () => {
      mockPrismaService.e_resources.findMany.mockResolvedValue([]);
      mockPrismaService.e_resources.count.mockResolvedValue(0);

      const result = await service.findAll({ q: 'nonexistent' });

      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe('findOne', () => {
    it('should return an e-resource when found', async () => {
      mockPrismaService.e_resources.findUnique.mockResolvedValue({
        id: 1,
        title: 'JSTOR',
        url: 'https://jstor.org',
        category_id: 2,
        book_categories: { id: 2, name: 'Humanities' },
      });

      const result = await service.findOne(1);

      expect(mockPrismaService.e_resources.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { book_categories: { select: { id: true, name: true } } },
      });
      expect(result.category_name).toBe('Humanities');
    });

    it('should throw NotFoundException when e-resource does not exist', async () => {
      mockPrismaService.e_resources.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should throw NotFoundException when e-resource does not exist', async () => {
      mockPrismaService.e_resources.findUnique.mockResolvedValue(null);

      await expect(service.update(1, { title: 'New title' })).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPrismaService.e_resources.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when new category does not exist', async () => {
      mockPrismaService.e_resources.findUnique.mockResolvedValue({ id: 1 });
      mockPrismaService.book_categories.findUnique.mockResolvedValue(null);

      await expect(service.update(1, { category_id: 99 })).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPrismaService.e_resources.update).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when new URL belongs to another e-resource', async () => {
      mockPrismaService.e_resources.findUnique.mockResolvedValue({ id: 1 });
      mockPrismaService.e_resources.findFirst.mockResolvedValue({
        id: 2,
        url: 'https://jstor.org',
      });

      await expect(
        service.update(1, { url: 'https://jstor.org' }),
      ).rejects.toThrow(ConflictException);
      expect(mockPrismaService.e_resources.findFirst).toHaveBeenCalledWith({
        where: {
          url: { equals: 'https://jstor.org', mode: 'insensitive' },
          NOT: { id: 1 },
        },
      });
      expect(mockPrismaService.e_resources.update).not.toHaveBeenCalled();
    });

    it('should update the e-resource successfully', async () => {
      mockPrismaService.e_resources.findUnique.mockResolvedValue({ id: 1 });
      mockPrismaService.e_resources.update.mockResolvedValue({
        id: 1,
        title: 'Updated title',
        url: 'https://jstor.org',
        category_id: 1,
        book_categories: { id: 1, name: 'Humanities' },
      });

      const result = await service.update(1, { title: 'Updated title' });

      expect(mockPrismaService.e_resources.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { title: 'Updated title' },
        include: { book_categories: { select: { id: true, name: true } } },
      });
      expect(result.title).toBe('Updated title');
    });
  });

  describe('remove', () => {
    it('should throw NotFoundException when e-resource does not exist', async () => {
      mockPrismaService.e_resources.findUnique.mockResolvedValue(null);

      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
      expect(mockPrismaService.e_resources.delete).not.toHaveBeenCalled();
    });

    it('should delete the e-resource successfully', async () => {
      mockPrismaService.e_resources.findUnique.mockResolvedValue({ id: 1 });
      mockPrismaService.e_resources.delete.mockResolvedValue({ id: 1 });

      const result = await service.remove(1);

      expect(mockPrismaService.e_resources.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual({ message: 'E-resource deleted successfully.' });
    });
  });

  describe('searchFuzzy', () => {
    it('should return matches ordered by similarity with scores exposed', async () => {
      mockPrismaService.$queryRaw.mockResolvedValue([
        {
          id: 1,
          title: 'IEEE Xplore Digital Library',
          url: 'https://ieeexplore.ieee.org',
          category_id: 1,
          category_name: 'Engineering',
          similarity: 0.62,
        },
      ]);

      const result = await service.searchFuzzy('ieee explor');

      expect(mockPrismaService.$queryRaw).toHaveBeenCalledTimes(1);
      expect(result).toEqual([
        {
          id: 1,
          title: 'IEEE Xplore Digital Library',
          url: 'https://ieeexplore.ieee.org',
          category_id: 1,
          category_name: 'Engineering',
          similarity: 0.62,
        },
      ]);
    });

    it('should return an empty array when nothing matches', async () => {
      mockPrismaService.$queryRaw.mockResolvedValue([]);

      const result = await service.searchFuzzy('zzzqqqxxx');

      expect(result).toEqual([]);
    });

    it('should cap the limit at 20 even when a larger value is requested', async () => {
      mockPrismaService.$queryRaw.mockResolvedValue([]);

      await service.searchFuzzy('ieee', 500);

      const templateArgs = mockPrismaService.$queryRaw.mock
        .calls[0] as unknown[];
      expect(templateArgs[templateArgs.length - 1]).toBe(20);
    });
  });
});
