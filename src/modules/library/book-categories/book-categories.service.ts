import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateBookCategoryDto } from './dto/create-book-category.dto';
import { UpdateBookCategoryDto } from './dto/update-book-category.dto';

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

  async findAll() {
    const categories = await this.prisma.book_categories.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    return {
      success: true,
      data: categories,
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