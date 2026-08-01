import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBusLiveLocationDto } from './dto/create-bus-live-location.dto';
import { UpdateBusLiveLocationDto } from './dto/update-bus-live-location.dto';

@Injectable()
export class BusLiveLocationsService {
  private readonly logger = new Logger(BusLiveLocationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * POST /bus-live-locations
   *
   * Error cases:
   *  404 BUS_NOT_FOUND  – bus_id does not exist
   *  500 INTERNAL_ERROR – unexpected failure (DB, etc.)
   */
  async create(dto: CreateBusLiveLocationDto) {
    await this.assertBusExists(dto.bus_id);

    try {
      return await this.prisma.bus_live_locations.create({
        data: {
          bus_id: dto.bus_id,
          latitude: dto.latitude,
          longitude: dto.longitude,
        },
      });
    } catch (err) {
      this.logger.error('DB error while creating bus live location', err);
      throw new InternalServerErrorException({
        message: 'Something went wrong. Please try again.',
        errorCode: 'INTERNAL_ERROR',
      });
    }
  }

  /**
   * GET /bus-live-locations
   * GET /bus-live-locations?bus_id=
   */
  async findAll(busId?: number) {
    try {
      return await this.prisma.bus_live_locations.findMany({
        where: busId !== undefined ? { bus_id: busId } : undefined,
        orderBy: { updated_at: 'desc' },
      });
    } catch (err) {
      this.logger.error('DB error while fetching bus live locations', err);
      throw new InternalServerErrorException({
        message: 'Something went wrong. Please try again.',
        errorCode: 'INTERNAL_ERROR',
      });
    }
  }

  /**
   * GET /bus-live-locations/:id
   *
   * Error cases:
   *  404 BUS_LIVE_LOCATION_NOT_FOUND – no record with the given id
   */
  async findOne(id: number) {
    const location = await this.findById(id);

    if (!location) {
      throw new NotFoundException({
        message: 'Bus live location not found',
        errorCode: 'BUS_LIVE_LOCATION_NOT_FOUND',
      });
    }

    return location;
  }

  /**
   * PUT/PATCH /bus-live-locations/:id
   *
   * Error cases:
   *  404 BUS_LIVE_LOCATION_NOT_FOUND – no record with the given id
   *  404 BUS_NOT_FOUND               – bus_id does not exist
   *  500 INTERNAL_ERROR              – unexpected failure (DB, etc.)
   */
  async update(id: number, dto: UpdateBusLiveLocationDto) {
    const location = await this.findById(id);

    if (!location) {
      throw new NotFoundException({
        message: 'Bus live location not found',
        errorCode: 'BUS_LIVE_LOCATION_NOT_FOUND',
      });
    }

    if (dto.bus_id !== undefined) {
      await this.assertBusExists(dto.bus_id);
    }

    try {
      return await this.prisma.bus_live_locations.update({
        where: { id },
        data: {
          bus_id: dto.bus_id,
          latitude: dto.latitude,
          longitude: dto.longitude,
        },
      });
    } catch (err) {
      this.logger.error('DB error while updating bus live location', err);
      throw new InternalServerErrorException({
        message: 'Something went wrong. Please try again.',
        errorCode: 'INTERNAL_ERROR',
      });
    }
  }

  /**
   * DELETE /bus-live-locations/:id
   *
   * No usage/in-use check is required — no other model in the schema
   * references bus_live_locations, so this row has no dependents.
   *
   * Error cases:
   *  404 BUS_LIVE_LOCATION_NOT_FOUND – no record with the given id
   *  500 INTERNAL_ERROR              – unexpected failure (DB, etc.)
   */
  async remove(id: number) {
    const location = await this.findById(id);

    if (!location) {
      throw new NotFoundException({
        message: 'Bus live location not found',
        errorCode: 'BUS_LIVE_LOCATION_NOT_FOUND',
      });
    }

    try {
      return await this.prisma.bus_live_locations.delete({ where: { id } });
    } catch (err) {
      this.logger.error('DB error while deleting bus live location', err);
      throw new InternalServerErrorException({
        message: 'Something went wrong. Please try again.',
        errorCode: 'INTERNAL_ERROR',
      });
    }
  }

  private async assertBusExists(busId: number) {
    let bus: unknown;

    try {
      bus = await this.prisma.buses.findUnique({ where: { id: busId } });
    } catch (err) {
      this.logger.error('DB error during bus lookup', err);
      throw new InternalServerErrorException({
        message: 'Something went wrong. Please try again.',
        errorCode: 'INTERNAL_ERROR',
      });
    }

    if (!bus) {
      throw new NotFoundException({
        message: 'Bus not found',
        errorCode: 'BUS_NOT_FOUND',
      });
    }
  }

  private async findById(id: number) {
    try {
      return await this.prisma.bus_live_locations.findUnique({ where: { id } });
    } catch (err) {
      this.logger.error('DB error during bus live location lookup', err);
      throw new InternalServerErrorException({
        message: 'Something went wrong. Please try again.',
        errorCode: 'INTERNAL_ERROR',
      });
    }
  }
}
