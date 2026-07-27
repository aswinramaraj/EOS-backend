import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { SearchBooksDto } from './dto/search-books.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

@Injectable()
export class BooksService {
  constructor(private readonly prisma: PrismaService) {}


  async create(dto: CreateBookDto) {
    // Check whether QR code already exists
    const existingBook = await this.prisma.books.findUnique({
      where: {
        qr_code: dto.qr_code,
      },
    });

    if (existingBook) {
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

    const where: any = {};

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
        throw new ConflictException(
          'Book with this QR code already exists.',
        );
      }
    }

    // Category validation
    if (dto.category_id) {
      const category =
        await this.prisma.book_categories.findUnique({
          where: {
            id: dto.category_id,
          },
        });

      if (!category) {
        throw new NotFoundException(
          'Book category not found.',
        );
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
    await this.prisma.books.delete({
      where: {
        id,
      },
    });

    return {
      message: 'Book deleted successfully.',
    };
  }
}