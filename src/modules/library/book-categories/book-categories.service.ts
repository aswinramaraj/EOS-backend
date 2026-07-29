import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import type { Prisma } from '../../../../generated/prisma/client';
import { CreateBookCategoryDto } from './dto/create-book-category.dto';
import { UpdateBookCategoryDto } from './dto/update-book-category.dto';
import { SearchBookCategoriesDto } from './dto/search-book-categories.dto';

// Minimum trigram/word similarity score for a row to count as a fuzzy match.
const FUZZY_SIMILARITY_THRESHOLD = 0.2;

interface CategoryFuzzySearchRow {
  id: number;
  name: string;
  similarity: number;
}

@Injectable()
export class BookCategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: CreateBookCategoryDto) {
    const existing = await this.prisma.book_categories.findUnique({
      where: {
        name: createDto.name,
      },
    });

    if (existing) {
      throw new ConflictException('Book category already exists.');
    }

    const category = await this.prisma.book_categories.create({
      data: {
        name: createDto.name,
      },
    });

    return {
      success: true,
      message: 'Book category created successfully.',
      data: category,
    };
  }

  async findAll(searchDto: SearchBookCategoriesDto = {}) {
    const { q, page = 1, page_size = 20 } = searchDto;

    const where: Prisma.book_categoriesWhereInput = {};

    if (q) {
      where.name = { contains: q, mode: 'insensitive' };
    }

    const [categories, total] = await this.prisma.$transaction([
      this.prisma.book_categories.findMany({
        where,
        orderBy: {
          name: 'asc',
        },
        skip: (page - 1) * page_size,
        take: page_size,
      }),

      this.prisma.book_categories.count({ where }),
    ]);

    return {
      success: true,
      page,
      page_size,
      total,
      data: categories,
    };
  }

  /**
   * Typo-tolerant search over category name using pg_trgm's similarity()
   * and word_similarity() (see BooksService.searchFuzzy for the rationale).
   */
  async searchFuzzy(query: string, limit = 20) {
    const q = query.trim();
    const cappedLimit = Math.min(limit ?? 20, 20);

    const rows = await this.prisma.$queryRaw<CategoryFuzzySearchRow[]>`
      SELECT
        id,
        name,
        GREATEST(
          similarity(name, ${q}),
          word_similarity(${q}, name)
        ) AS similarity
      FROM book_categories
      WHERE
        similarity(name, ${q}) > ${FUZZY_SIMILARITY_THRESHOLD}
        OR word_similarity(${q}, name) > ${FUZZY_SIMILARITY_THRESHOLD}
      ORDER BY similarity DESC
      LIMIT ${cappedLimit}
    `;

    return {
      success: true,
      data: rows.map((row) => ({
        id: row.id,
        name: row.name,
        similarity: Number(row.similarity),
      })),
    };
  }

  async findOne(id: number) {
    const category = await this.prisma.book_categories.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Book category not found.');
    }

    return {
      success: true,
      data: category,
    };
  }

  async update(id: number, updateDto: UpdateBookCategoryDto) {
    const category = await this.prisma.book_categories.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Book category not found.');
    }

    if (updateDto.name) {
      const duplicate = await this.prisma.book_categories.findFirst({
        where: {
          name: updateDto.name,
          NOT: {
            id,
          },
        },
      });

      if (duplicate) {
        throw new ConflictException('Book category already exists.');
      }
    }

    const updated = await this.prisma.book_categories.update({
      where: { id },
      data: updateDto,
    });

    return {
      success: true,
      message: 'Book category updated successfully.',
      data: updated,
    };
  }

  async remove(id: number) {
    const category = await this.prisma.book_categories.findUnique({
      where: { id },
      include: {
        books: true,
        e_resources: true,
      },
    });

    if (!category) {
      throw new NotFoundException('Book category not found.');
    }

    if (category.books.length > 0) {
      throw new ConflictException(
        'Cannot delete category because books are assigned to it.',
      );
    }

    if (category.e_resources.length > 0) {
      throw new ConflictException(
        'Cannot delete category because e-resources are assigned to it.',
      );
    }

    await this.prisma.book_categories.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'Book category deleted successfully.',
    };
  }
}
