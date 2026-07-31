import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { paginate } from '../../../common/dto/pagination.dto';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { ListCompaniesQueryDto } from './dto/list-companies-query.dto';

@Injectable()
export class CompaniesService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateCompanyDto) {
    return this.prisma.companies.create({
      data: {
        name: dto.name,
        profile_info: dto.profile_info,
      },
    });
  }

  async findAll(dto: ListCompaniesQueryDto) {
    const where = dto.search
      ? { name: { contains: dto.search, mode: 'insensitive' as const } }
      : {};

    const [data, total] = await Promise.all([
      this.prisma.companies.findMany({
        where,
        skip: dto.skip,
        take: dto.limit,
        orderBy: { name: 'asc' },
      }),
      this.prisma.companies.count({ where }),
    ]);

    return paginate(data, total, dto);
  }

  async findOne(id: number) {
    return this.findOrThrow(id);
  }

  async update(id: number, dto: UpdateCompanyDto) {
    await this.findOrThrow(id);

    return this.prisma.companies.update({
      where: { id },
      data: {
        name: dto.name,
        profile_info: dto.profile_info,
      },
    });
  }

  async remove(id: number) {
    await this.findOrThrow(id);

    const driveCount = await this.prisma.placement_drives.count({
      where: { company_id: id },
    });
    if (driveCount > 0) {
      throw new ConflictException(
        'Cannot delete a company that has placement drives associated with it',
      );
    }

    await this.prisma.companies.delete({ where: { id } });
    return { id };
  }

  private async findOrThrow(id: number) {
    const company = await this.prisma.companies.findUnique({ where: { id } });
    if (!company) throw new NotFoundException(`Company ${id} not found`);
    return company;
  }
}
