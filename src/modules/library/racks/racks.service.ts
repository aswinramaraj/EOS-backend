import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import type { Prisma } from 'generated/prisma/client';
import { CreateRackDto } from './dto/create-rack.dto';
import { UpdateRackDto } from './dto/update-rack.dto';
import { SearchRacksDto } from './dto/search-racks.dto';

@Injectable()
export class RacksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateRackDto) {
    const existing = await this.prisma.library_racks.findUnique({
      where: { rack_code: dto.rack_code },
    });

    if (existing) {
      throw new ConflictException('A rack with this code already exists.');
    }

    return this.prisma.library_racks.create({ data: dto });
  }

  async findAll(dto: SearchRacksDto) {
    const { q, page = 1, page_size = 20 } = dto;

    const where: Prisma.library_racksWhereInput = {};
    if (q) {
      where.OR = [
        { rack_code: { contains: q, mode: 'insensitive' } },
        { subject_range: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [racks, total] = await this.prisma.$transaction([
      this.prisma.library_racks.findMany({
        where,
        orderBy: { rack_code: 'asc' },
        skip: (page - 1) * page_size,
        take: page_size,
      }),
      this.prisma.library_racks.count({ where }),
    ]);

    return { page, page_size, total, data: racks };
  }

  async findOne(id: number) {
    const rack = await this.prisma.library_racks.findUnique({
      where: { id },
    });

    if (!rack) {
      throw new NotFoundException('Rack not found.');
    }

    return rack;
  }

  async update(id: number, dto: UpdateRackDto) {
    const rack = await this.prisma.library_racks.findUnique({
      where: { id },
    });

    if (!rack) {
      throw new NotFoundException('Rack not found.');
    }

    if (dto.rack_code) {
      const existing = await this.prisma.library_racks.findFirst({
        where: { rack_code: dto.rack_code, NOT: { id } },
      });

      if (existing) {
        throw new ConflictException('A rack with this code already exists.');
      }
    }

    return this.prisma.library_racks.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    const rack = await this.prisma.library_racks.findUnique({
      where: { id },
    });

    if (!rack) {
      throw new NotFoundException('Rack not found.');
    }

    const assignedBook = await this.prisma.books.findFirst({
      where: { rack_id: id },
    });

    if (assignedBook) {
      throw new ConflictException(
        'Cannot delete a rack that still has books assigned to it.',
      );
    }

    await this.prisma.library_racks.delete({ where: { id } });

    return { message: 'Rack deleted successfully.' };
  }
}
