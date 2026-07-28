jest.mock('src/prisma/prisma.service', () => ({
  PrismaService: jest.fn(),
}));

import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { BookCategoriesService } from './book-categories.service';
import { PrismaService } from '../../../prisma/prisma.service';

describe('BookCategoriesService', () => {
  let service: BookCategoriesService;

  const mockPrismaService = {
    book_categories: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $queryRaw: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookCategoriesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<BookCategoriesService>(BookCategoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto = { name: 'Computer Science' };

    it('should create a category successfully', async () => {
      mockPrismaService.book_categories.findUnique.mockResolvedValue(null);
      mockPrismaService.book_categories.create.mockResolvedValue({
        id: 1,
        name: 'Computer Science',
      });

      const result = await service.create(createDto);

      expect(mockPrismaService.book_categories.findUnique).toHaveBeenCalledWith(
        {
          where: { name: createDto.name },
        },
      );
      expect(mockPrismaService.book_categories.create).toHaveBeenCalledWith({
        data: { name: createDto.name },
      });
      expect(result).toEqual({
        success: true,
        message: 'Book category created successfully.',
        data: { id: 1, name: 'Computer Science' },
      });
    });

    it('should throw ConflictException when category name already exists', async () => {
      mockPrismaService.book_categories.findUnique.mockResolvedValue({
        id: 1,
        name: 'Computer Science',
      });

      await expect(service.create(createDto)).rejects.toThrow(
        ConflictException,
      );
      expect(mockPrismaService.book_categories.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all categories ordered by name', async () => {
      const categories = [
        { id: 1, name: 'Fiction' },
        { id: 2, name: 'Science' },
      ];
      mockPrismaService.book_categories.findMany.mockResolvedValue(categories);

      const result = await service.findAll();

      expect(mockPrismaService.book_categories.findMany).toHaveBeenCalledWith({
        orderBy: { name: 'asc' },
      });
      expect(result).toEqual({ success: true, data: categories });
    });

    it('should return an empty list when no categories exist', async () => {
      mockPrismaService.book_categories.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual({ success: true, data: [] });
    });
  });

  describe('findOne', () => {
    it('should return a category when found', async () => {
      mockPrismaService.book_categories.findUnique.mockResolvedValue({
        id: 1,
        name: 'Fiction',
      });

      const result = await service.findOne(1);

      expect(mockPrismaService.book_categories.findUnique).toHaveBeenCalledWith(
        {
          where: { id: 1 },
        },
      );
      expect(result).toEqual({
        success: true,
        data: { id: 1, name: 'Fiction' },
      });
    });

    it('should throw NotFoundException when category does not exist', async () => {
      mockPrismaService.book_categories.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should throw NotFoundException when category does not exist', async () => {
      mockPrismaService.book_categories.findUnique.mockResolvedValue(null);

      await expect(service.update(1, { name: 'New name' })).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPrismaService.book_categories.update).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when new name is already used by another category', async () => {
      mockPrismaService.book_categories.findUnique.mockResolvedValue({
        id: 1,
        name: 'Fiction',
      });
      mockPrismaService.book_categories.findFirst.mockResolvedValue({
        id: 2,
        name: 'Science',
      });

      await expect(service.update(1, { name: 'Science' })).rejects.toThrow(
        ConflictException,
      );
      expect(mockPrismaService.book_categories.findFirst).toHaveBeenCalledWith({
        where: { name: 'Science', NOT: { id: 1 } },
      });
      expect(mockPrismaService.book_categories.update).not.toHaveBeenCalled();
    });

    it('should update the category successfully', async () => {
      mockPrismaService.book_categories.findUnique.mockResolvedValue({
        id: 1,
        name: 'Fiction',
      });
      mockPrismaService.book_categories.update.mockResolvedValue({
        id: 1,
        name: 'Literature',
      });

      const result = await service.update(1, { name: 'Literature' });

      expect(mockPrismaService.book_categories.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { name: 'Literature' },
      });
      expect(result).toEqual({
        success: true,
        message: 'Book category updated successfully.',
        data: { id: 1, name: 'Literature' },
      });
    });

    it('should update successfully without a duplicate check when name is not provided', async () => {
      mockPrismaService.book_categories.findUnique.mockResolvedValue({
        id: 1,
        name: 'Fiction',
      });
      mockPrismaService.book_categories.update.mockResolvedValue({
        id: 1,
        name: 'Fiction',
      });

      await service.update(1, {});

      expect(
        mockPrismaService.book_categories.findFirst,
      ).not.toHaveBeenCalled();
      expect(mockPrismaService.book_categories.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {},
      });
    });
  });

  describe('remove', () => {
    it('should throw NotFoundException when category does not exist', async () => {
      mockPrismaService.book_categories.findUnique.mockResolvedValue(null);

      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
      expect(mockPrismaService.book_categories.delete).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when books are assigned to the category', async () => {
      mockPrismaService.book_categories.findUnique.mockResolvedValue({
        id: 1,
        name: 'Fiction',
        books: [{ id: 1 }],
        e_resources: [],
      });

      await expect(service.remove(1)).rejects.toThrow(ConflictException);
      expect(mockPrismaService.book_categories.delete).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when e-resources are assigned to the category', async () => {
      mockPrismaService.book_categories.findUnique.mockResolvedValue({
        id: 1,
        name: 'Fiction',
        books: [],
        e_resources: [{ id: 1 }],
      });

      await expect(service.remove(1)).rejects.toThrow(ConflictException);
      expect(mockPrismaService.book_categories.delete).not.toHaveBeenCalled();
    });

    it('should delete the category successfully when no relationships exist', async () => {
      mockPrismaService.book_categories.findUnique.mockResolvedValue({
        id: 1,
        name: 'Fiction',
        books: [],
        e_resources: [],
      });
      mockPrismaService.book_categories.delete.mockResolvedValue({ id: 1 });

      const result = await service.remove(1);

      expect(mockPrismaService.book_categories.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual({
        success: true,
        message: 'Book category deleted successfully.',
      });
    });
  });

  describe('searchFuzzy', () => {
    it('should return matches ordered by similarity with scores exposed', async () => {
      mockPrismaService.$queryRaw.mockResolvedValue([
        { id: 1, name: 'Engineering', similarity: 0.55 },
      ]);

      const result = await service.searchFuzzy('enginering');

      expect(mockPrismaService.$queryRaw).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        success: true,
        data: [{ id: 1, name: 'Engineering', similarity: 0.55 }],
      });
    });

    it('should return an empty array when nothing matches', async () => {
      mockPrismaService.$queryRaw.mockResolvedValue([]);

      const result = await service.searchFuzzy('zzzqqqxxx');

      expect(result).toEqual({ success: true, data: [] });
    });

    it('should cap the limit at 20 even when a larger value is requested', async () => {
      mockPrismaService.$queryRaw.mockResolvedValue([]);

      await service.searchFuzzy('computer', 500);

      const templateArgs = mockPrismaService.$queryRaw.mock
        .calls[0] as unknown[];
      expect(templateArgs[templateArgs.length - 1]).toBe(20);
    });
  });
});
