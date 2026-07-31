import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { SearchBooksDto } from './dto/search-books.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import type { Prisma } from 'generated/prisma/client';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

function isForeignKeyViolation(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as { code?: unknown }).code === 'P2003'
  );
}

// Minimum trigram/word similarity score for a row to count as a fuzzy match.
const FUZZY_SIMILARITY_THRESHOLD = 0.2;

interface BookFuzzySearchRow {
  id: number;
  qr_code: string;
  title: string;
  author: string | null;
  category_id: number;
  category_name: string;
  total_copies: number;
  available_copies: number;
  similarity: number;
}

@Injectable()
export class BooksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateBookDto) {
    // Same title + author already catalogued? Add to its copies instead of
    // creating a duplicate entry for the same book.
    const existingBook = await this.prisma.books.findFirst({
      where: {
        title: { equals: dto.title, mode: 'insensitive' },
        author: dto.author ? { equals: dto.author, mode: 'insensitive' } : null,
      },
      include: {
        book_categories: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (existingBook) {
      const updated = await this.prisma.books.update({
        where: {
          id: existingBook.id,
        },
        data: {
          total_copies: {
            increment: dto.total_copies,
          },
          available_copies: {
            increment: dto.total_copies,
          },
        },
        include: {
          book_categories: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return {
        id: updated.id,
        qr_code: updated.qr_code,
        title: updated.title,
        author: updated.author,
        category_id: updated.category_id,
        category_name: updated.book_categories.name,
        total_copies: updated.total_copies,
        available_copies: updated.available_copies,
      };
    }

    // Check whether QR code already exists
    const existingQrCode = await this.prisma.books.findUnique({
      where: {
        qr_code: dto.qr_code,
      },
    });

    if (existingQrCode) {
      throw new ConflictException('Book with this QR code already exists.');
    }

    // Check whether category exists
    const category = await this.prisma.book_categories.findUnique({
      where: {
        id: dto.category_id,
      },
    });

    if (!category) {
      throw new NotFoundException('Book category not found.');
    }

    // Create the book
    const book = await this.prisma.books.create({
      data: {
        qr_code: dto.qr_code,
        title: dto.title,
        author: dto.author,
        category_id: dto.category_id,
        total_copies: dto.total_copies,
        available_copies: dto.total_copies,
      },
      include: {
        book_categories: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return {
      id: book.id,
      qr_code: book.qr_code,
      title: book.title,
      author: book.author,
      category_id: book.category_id,
      category_name: book.book_categories.name,
      total_copies: book.total_copies,
      available_copies: book.available_copies,
    };
  }

  async findAll(searchDto: SearchBooksDto) {
    const {
      q,
      category_id,
      available_only = false,
      page = 1,
      page_size = 20,
    } = searchDto;

    const where: Prisma.booksWhereInput = {};

    if (q) {
      where.OR = [
        {
          title: {
            contains: q,
            mode: 'insensitive',
          },
        },
        {
          author: {
            contains: q,
            mode: 'insensitive',
          },
        },
      ];
    }

    if (category_id) {
      where.category_id = category_id;
    }

    if (available_only) {
      where.available_copies = {
        gt: 0,
      };
    }

    const [books, total] = await this.prisma.$transaction([
      this.prisma.books.findMany({
        where,

        include: {
          book_categories: {
            select: {
              id: true,
              name: true,
            },
          },
        },

        orderBy: {
          title: 'asc',
        },

        skip: (page - 1) * page_size,

        take: page_size,
      }),

      this.prisma.books.count({
        where,
      }),
    ]);

    return {
      page,
      page_size,
      total,

      data: books.map((book) => ({
        id: book.id,
        qr_code: book.qr_code,
        title: book.title,
        author: book.author,

        total_copies: book.total_copies,
        available_copies: book.available_copies,

        category: {
          id: book.book_categories.id,
          name: book.book_categories.name,
        },
      })),
    };
  }

  /**
   * Typo-tolerant search over title/author using pg_trgm's similarity() and
   * word_similarity(). word_similarity matches the query against the best
   * substring of the target, so short/partial queries (e.g. "computr")
   * still score well against long titles ("Computer Science Engineering").
   */
  async searchFuzzy(query: string, limit = 20) {
    const q = query.trim();
    const cappedLimit = Math.min(limit ?? 20, 20);

    const rows = await this.prisma.$queryRaw<BookFuzzySearchRow[]>`
      SELECT
        b.id,
        b.qr_code,
        b.title,
        b.author,
        b.category_id,
        bc.name AS category_name,
        b.total_copies,
        b.available_copies,
        GREATEST(
          similarity(b.title, ${q}),
          word_similarity(${q}, b.title),
          COALESCE(word_similarity(${q}, b.author), 0)
        ) AS similarity
      FROM books b
      JOIN book_categories bc ON bc.id = b.category_id
      WHERE
        similarity(b.title, ${q}) > ${FUZZY_SIMILARITY_THRESHOLD}
        OR word_similarity(${q}, b.title) > ${FUZZY_SIMILARITY_THRESHOLD}
        OR (b.author IS NOT NULL AND word_similarity(${q}, b.author) > ${FUZZY_SIMILARITY_THRESHOLD})
      ORDER BY similarity DESC
      LIMIT ${cappedLimit}
    `;

    return rows.map((row) => ({
      id: row.id,
      qr_code: row.qr_code,
      title: row.title,
      author: row.author,
      category_id: row.category_id,
      category_name: row.category_name,
      total_copies: row.total_copies,
      available_copies: row.available_copies,
      similarity: Number(row.similarity),
    }));
  }

  async findOne(id: number) {
    const book = await this.prisma.books.findUnique({
      where: {
        id,
      },
      include: {
        book_categories: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!book) {
      throw new NotFoundException('Book not found.');
    }

    return {
      id: book.id,
      qr_code: book.qr_code,
      title: book.title,
      author: book.author,
      category_id: book.category_id,
      category_name: book.book_categories.name,
      total_copies: book.total_copies,
      available_copies: book.available_copies,
    };
  }

  async update(id: number, dto: UpdateBookDto) {
    const book = await this.prisma.books.findUnique({
      where: { id },
    });

    if (!book) {
      throw new NotFoundException('Book not found.');
    }

    // QR validation
    if (dto.qr_code) {
      const existing = await this.prisma.books.findFirst({
        where: {
          qr_code: dto.qr_code,
          NOT: {
            id,
          },
        },
      });

      if (existing) {
        throw new ConflictException('Book with this QR code already exists.');
      }
    }

    // Category validation
    if (dto.category_id) {
      const category = await this.prisma.book_categories.findUnique({
        where: {
          id: dto.category_id,
        },
      });

      if (!category) {
        throw new NotFoundException('Book category not found.');
      }
    }

    const updated = await this.prisma.books.update({
      where: { id },
      data: dto,
      include: {
        book_categories: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return {
      id: updated.id,
      qr_code: updated.qr_code,
      title: updated.title,
      author: updated.author,
      category_id: updated.category_id,
      category_name: updated.book_categories.name,
      total_copies: updated.total_copies,
      available_copies: updated.available_copies,
    };
  }

  async remove(id: number) {
    // Check whether book exists
    const book = await this.prisma.books.findUnique({
      where: {
        id,
      },
    });

    if (!book) {
      throw new NotFoundException('Book not found.');
    }

    // Check if the book is currently borrowed
    const borrowed = await this.prisma.book_borrow_records.findFirst({
      where: {
        book_id: id,
        status: 'borrowed',
      },
    });

    if (borrowed) {
      throw new ConflictException(
        'Cannot delete a book that is currently borrowed.',
      );
    }

    // Delete book
    try {
      await this.prisma.books.delete({
        where: {
          id,
        },
      });
    } catch (err) {
      if (isForeignKeyViolation(err)) {
        throw new ConflictException(
          'Cannot delete a book with existing borrow history.',
        );
      }
      throw err;
    }

    return {
      message: 'Book deleted successfully.',
    };
  }
}
