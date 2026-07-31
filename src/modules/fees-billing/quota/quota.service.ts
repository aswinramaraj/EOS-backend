import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateQuotaDto } from './dto/create-quota.dto';
import { UpdateQuotaDto } from './dto/update-quota.dto';

@Injectable()
export class QuotaService {
  private readonly logger = new Logger(QuotaService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * POST /quotas
   *
   * Error cases:
   *  409 QUOTA_EXISTS   – a quota with the same name already exists
   *  500 INTERNAL_ERROR – unexpected failure (DB, etc.)
   */
  async create(dto: CreateQuotaDto) {
    const existing = await this.findByName(dto.name);

    if (existing) {
      throw new ConflictException({
        message: 'A quota with this name already exists',
        errorCode: 'QUOTA_EXISTS',
      });
    }

    try {
      return await this.prisma.quotas.create({
        data: { name: dto.name },
      });
    } catch (err) {
      this.logger.error('DB error while creating quota', err);
      throw new InternalServerErrorException({
        message: 'Something went wrong. Please try again.',
        errorCode: 'INTERNAL_ERROR',
      });
    }
  }

  /**
   * GET /quotas
   */
  async findAll() {
    try {
      return await this.prisma.quotas.findMany({
        orderBy: { name: 'asc' },
      });
    } catch (err) {
      this.logger.error('DB error while fetching quotas', err);
      throw new InternalServerErrorException({
        message: 'Something went wrong. Please try again.',
        errorCode: 'INTERNAL_ERROR',
      });
    }
  }

  /**
   * GET /quotas/:id
   *
   * Error cases:
   *  404 QUOTA_NOT_FOUND – no quota with the given id
   */
  async findOne(id: number) {
    const quota = await this.findById(id);

    if (!quota) {
      throw new NotFoundException({
        message: 'Quota not found',
        errorCode: 'QUOTA_NOT_FOUND',
      });
    }

    return quota;
  }

  /**
   * PUT /quotas/:id
   *
   * Error cases:
   *  404 QUOTA_NOT_FOUND – no quota with the given id
   *  409 QUOTA_EXISTS    – another quota already uses this name
   */
  async update(id: number, dto: UpdateQuotaDto) {
    const quota = await this.findById(id);

    if (!quota) {
      throw new NotFoundException({
        message: 'Quota not found',
        errorCode: 'QUOTA_NOT_FOUND',
      });
    }

    if (dto.name) {
      const existing = await this.findByName(dto.name);

      if (existing && existing.id !== id) {
        throw new ConflictException({
          message: 'A quota with this name already exists',
          errorCode: 'QUOTA_EXISTS',
        });
      }
    }

    try {
      return await this.prisma.quotas.update({
        where: { id },
        data: { name: dto.name },
      });
    } catch (err) {
      this.logger.error('DB error while updating quota', err);
      throw new InternalServerErrorException({
        message: 'Something went wrong. Please try again.',
        errorCode: 'INTERNAL_ERROR',
      });
    }
  }

  /**
   * DELETE /quotas/:id
   *
   * Error cases:
   *  404 QUOTA_NOT_FOUND – no quota with the given id
   *  409 QUOTA_IN_USE    – quota is referenced by fee_structures or students
   */
  async remove(id: number) {
    const quota = await this.findById(id);

    if (!quota) {
      throw new NotFoundException({
        message: 'Quota not found',
        errorCode: 'QUOTA_NOT_FOUND',
      });
    }

    let usageCounts: number[];

    try {
      usageCounts = await Promise.all([
        this.prisma.fee_structures.count({ where: { quota_id: id } }),
        this.prisma.students.count({ where: { quota_id: id } }),
      ]);
    } catch (err) {
      this.logger.error('DB error while checking quota usage', err);
      throw new InternalServerErrorException({
        message: 'Something went wrong. Please try again.',
        errorCode: 'INTERNAL_ERROR',
      });
    }

    if (usageCounts.some((count) => count > 0)) {
      throw new ConflictException({
        message: 'This quota is in use and cannot be deleted',
        errorCode: 'QUOTA_IN_USE',
      });
    }

    try {
      return await this.prisma.quotas.delete({
        where: { id },
      });
    } catch (err) {
      this.logger.error('DB error while deleting quota', err);
      throw new InternalServerErrorException({
        message: 'Something went wrong. Please try again.',
        errorCode: 'INTERNAL_ERROR',
      });
    }
  }

  private async findByName(name: string) {
    try {
      return await this.prisma.quotas.findUnique({ where: { name } });
    } catch (err) {
      this.logger.error('DB error during quota duplicate check', err);
      throw new InternalServerErrorException({
        message: 'Something went wrong. Please try again.',
        errorCode: 'INTERNAL_ERROR',
      });
    }
  }

  private async findById(id: number) {
    try {
      return await this.prisma.quotas.findUnique({ where: { id } });
    } catch (err) {
      this.logger.error('DB error during quota lookup', err);
      throw new InternalServerErrorException({
        message: 'Something went wrong. Please try again.',
        errorCode: 'INTERNAL_ERROR',
      });
    }
  }
}
