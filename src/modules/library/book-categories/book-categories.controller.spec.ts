jest.mock('src/prisma/prisma.service', () => ({
  PrismaService: jest.fn(),
}));

import { Test, TestingModule } from '@nestjs/testing';
import { BookCategoriesController } from './book-categories.controller';
import { BookCategoriesService } from './book-categories.service';

describe('BookCategoriesController', () => {
  let controller: BookCategoriesController;

  const mockBookCategoriesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    searchFuzzy: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookCategoriesController],
      providers: [
        {
          provide: BookCategoriesService,
          useValue: mockBookCategoriesService,
        },
      ],
    }).compile();

    controller = module.get<BookCategoriesController>(BookCategoriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('create should call service.create with the dto and return its result', async () => {
    const dto = { name: 'Computer Science' };
    const expected = {
      success: true,
      message: 'Book category created successfully.',
      data: { id: 1, ...dto },
    };
    mockBookCategoriesService.create.mockResolvedValue(expected);

    const result = await controller.create(dto);

    expect(mockBookCategoriesService.create).toHaveBeenCalledWith(dto);
    expect(result).toBe(expected);
  });

  it('findAll should call service.findAll and return its result', async () => {
    const expected = { success: true, data: [{ id: 1, name: 'Fiction' }] };
    mockBookCategoriesService.findAll.mockResolvedValue(expected);

    const result = await controller.findAll();

    expect(mockBookCategoriesService.findAll).toHaveBeenCalled();
    expect(result).toBe(expected);
  });

  it('findOne should call service.findOne with the numeric id and return its result', async () => {
    const expected = { success: true, data: { id: 1, name: 'Fiction' } };
    mockBookCategoriesService.findOne.mockResolvedValue(expected);

    const result = await controller.findOne('1');

    expect(mockBookCategoriesService.findOne).toHaveBeenCalledWith(1);
    expect(result).toBe(expected);
  });

  it('update should call service.update with the numeric id and dto and return its result', async () => {
    const dto = { name: 'Literature' };
    const expected = {
      success: true,
      message: 'Book category updated successfully.',
      data: { id: 1, name: 'Literature' },
    };
    mockBookCategoriesService.update.mockResolvedValue(expected);

    const result = await controller.update('1', dto);

    expect(mockBookCategoriesService.update).toHaveBeenCalledWith(1, dto);
    expect(result).toBe(expected);
  });

  it('remove should call service.remove with the numeric id and return its result', async () => {
    const expected = {
      success: true,
      message: 'Book category deleted successfully.',
    };
    mockBookCategoriesService.remove.mockResolvedValue(expected);

    const result = await controller.remove('1');

    expect(mockBookCategoriesService.remove).toHaveBeenCalledWith(1);
    expect(result).toBe(expected);
  });

  it('searchFuzzy should call service.searchFuzzy with the query and limit and return its result', async () => {
    const query = { q: 'enginering', limit: 20 };
    const expected = {
      success: true,
      data: [{ id: 1, name: 'Engineering', similarity: 0.5 }],
    };
    mockBookCategoriesService.searchFuzzy.mockResolvedValue(expected);

    const result = await controller.searchFuzzy(query);

    expect(mockBookCategoriesService.searchFuzzy).toHaveBeenCalledWith(
      'enginering',
      20,
    );
    expect(result).toBe(expected);
  });
});
