jest.mock('src/prisma/prisma.service', () => ({
  PrismaService: jest.fn(),
}));

import { Test, TestingModule } from '@nestjs/testing';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';

describe('BooksController', () => {
  let controller: BooksController;

  const mockBooksService = {
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
      controllers: [BooksController],
      providers: [
        {
          provide: BooksService,
          useValue: mockBooksService,
        },
      ],
    }).compile();

    controller = module.get<BooksController>(BooksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAll should call service.findAll with the query dto and return its result', async () => {
    const query = { q: 'clean', page: 1, page_size: 20 };
    const expected = { page: 1, page_size: 20, total: 0, data: [] };
    mockBooksService.findAll.mockResolvedValue(expected);

    const result = await controller.findAll(query);

    expect(mockBooksService.findAll).toHaveBeenCalledWith(query);
    expect(result).toBe(expected);
  });

  it('findOne should call service.findOne with the parsed id and return its result', async () => {
    const expected = { id: 1, title: 'A Book' };
    mockBooksService.findOne.mockResolvedValue(expected);

    const result = await controller.findOne(1);

    expect(mockBooksService.findOne).toHaveBeenCalledWith(1);
    expect(result).toBe(expected);
  });

  it('create should call service.create with the dto and return its result', async () => {
    const dto = {
      qr_code: 'QR-1',
      title: 'New Book',
      category_id: 1,
      total_copies: 3,
    };
    const expected = { id: 1, ...dto };
    mockBooksService.create.mockResolvedValue(expected);

    const result = await controller.create(dto);

    expect(mockBooksService.create).toHaveBeenCalledWith(dto);
    expect(result).toBe(expected);
  });

  it('update should call service.update with the parsed id and dto and return its result', async () => {
    const dto = { title: 'Updated title' };
    const expected = { id: 1, title: 'Updated title' };
    mockBooksService.update.mockResolvedValue(expected);

    const result = await controller.update(1, dto);

    expect(mockBooksService.update).toHaveBeenCalledWith(1, dto);
    expect(result).toBe(expected);
  });

  it('remove should call service.remove with the parsed id and return its result', async () => {
    const expected = { message: 'Book deleted successfully.' };
    mockBooksService.remove.mockResolvedValue(expected);

    const result = await controller.remove(1);

    expect(mockBooksService.remove).toHaveBeenCalledWith(1);
    expect(result).toBe(expected);
  });

  it('searchFuzzy should call service.searchFuzzy with the query and limit and return its result', async () => {
    const query = { q: 'computr', limit: 20 };
    const expected = [
      { id: 1, title: 'Computer Science Engineering', similarity: 0.6 },
    ];
    mockBooksService.searchFuzzy.mockResolvedValue(expected);

    const result = await controller.searchFuzzy(query);

    expect(mockBooksService.searchFuzzy).toHaveBeenCalledWith('computr', 20);
    expect(result).toBe(expected);
  });
});
