import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBusDto } from './dto/create-bus.dto';
import { UpdateBusDto } from './dto/update-bus.dto';

@Injectable()
export class BusesService {
  private readonly logger = new Logger(BusesService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * POST /buses
   *
   * Error cases:
   *  404 TRANSPORT_ROUTE_NOT_FOUND  – route_id does not exist
   *  409 BUS_VEHICLE_NUMBER_EXISTS – a bus with the same vehicle_number already exists
   *  500 INTERNAL_ERROR            – unexpected failure (DB, etc.)
   */
  async create(dto: CreateBusDto) {
    if (dto.route_id !== undefined) {
      await this.assertRouteExists(dto.route_id);
    }

    const existing = await this.findByVehicleNumber(dto.vehicle_number);

    if (existing) {
      throw new ConflictException({
        message: 'A bus with this vehicle number already exists',
        errorCode: 'BUS_VEHICLE_NUMBER_EXISTS',
      });
    }

    try {
      return await this.prisma.buses.create({
        data: {
          vehicle_number: dto.vehicle_number,
          route_id: dto.route_id,
          driver_name: dto.driver_name,
          gps_device_id: dto.gps_device_id,
        },
      });
    } catch (err) {
      this.logger.error('DB error while creating bus', err);
      throw new InternalServerErrorException({
        message: 'Something went wrong. Please try again.',
        errorCode: 'INTERNAL_ERROR',
      });
    }
  }

  /**
   * GET /buses
   */
  async findAll() {
    try {
      return await this.prisma.buses.findMany({
        orderBy: { vehicle_number: 'asc' },
      });
    } catch (err) {
      this.logger.error('DB error while fetching buses', err);
      throw new InternalServerErrorException({
        message: 'Something went wrong. Please try again.',
        errorCode: 'INTERNAL_ERROR',
      });
    }
  }

  /**
   * GET /buses/:id
   *
   * Error cases:
   *  404 BUS_NOT_FOUND – no bus with the given id
   */
  async findOne(id: number) {
    const bus = await this.findById(id);

    if (!bus) {
      throw new NotFoundException({
        message: 'Bus not found',
        errorCode: 'BUS_NOT_FOUND',
      });
    }

    return bus;
  }

  /**
   * PUT/PATCH /buses/:id
   *
   * Error cases:
   *  404 BUS_NOT_FOUND              – no bus with the given id
   *  404 TRANSPORT_ROUTE_NOT_FOUND  – route_id does not exist
   *  409 BUS_VEHICLE_NUMBER_EXISTS  – another bus already uses this vehicle_number
   *  500 INTERNAL_ERROR             – unexpected failure (DB, etc.)
   */
  async update(id: number, dto: UpdateBusDto) {
    const bus = await this.findById(id);

    if (!bus) {
      throw new NotFoundException({
        message: 'Bus not found',
        errorCode: 'BUS_NOT_FOUND',
      });
    }

    if (dto.route_id !== undefined && dto.route_id !== null) {
      await this.assertRouteExists(dto.route_id);
    }

    if (dto.vehicle_number !== undefined) {
      const existing = await this.findByVehicleNumber(dto.vehicle_number);

      if (existing && existing.id !== id) {
        throw new ConflictException({
          message: 'A bus with this vehicle number already exists',
          errorCode: 'BUS_VEHICLE_NUMBER_EXISTS',
        });
      }
    }

    try {
      return await this.prisma.buses.update({
        where: { id },
        data: {
          vehicle_number: dto.vehicle_number,
          route_id: dto.route_id,
          driver_name: dto.driver_name,
          gps_device_id: dto.gps_device_id,
        },
      });
    } catch (err) {
      this.logger.error('DB error while updating bus', err);
      throw new InternalServerErrorException({
        message: 'Something went wrong. Please try again.',
        errorCode: 'INTERNAL_ERROR',
      });
    }
  }

  /**
   * DELETE /buses/:id
   *
   * Error cases:
   *  404 BUS_NOT_FOUND – no bus with the given id
   *  409 BUS_IN_USE    – bus is referenced by bus_live_locations
   *  500 INTERNAL_ERROR – unexpected failure (DB, etc.)
   */
  async remove(id: number) {
    const bus = await this.findById(id);

    if (!bus) {
      throw new NotFoundException({
        message: 'Bus not found',
        errorCode: 'BUS_NOT_FOUND',
      });
    }

    let liveLocationCount: number;

    try {
      liveLocationCount = await this.prisma.bus_live_locations.count({ where: { bus_id: id } });
    } catch (err) {
      this.logger.error('DB error while checking bus usage', err);
      throw new InternalServerErrorException({
        message: 'Something went wrong. Please try again.',
        errorCode: 'INTERNAL_ERROR',
      });
    }

    if (liveLocationCount > 0) {
      throw new ConflictException({
        message: 'This bus is in use and cannot be deleted',
        errorCode: 'BUS_IN_USE',
      });
    }

    try {
      return await this.prisma.buses.delete({ where: { id } });
    } catch (err) {
      this.logger.error('DB error while deleting bus', err);
      throw new InternalServerErrorException({
        message: 'Something went wrong. Please try again.',
        errorCode: 'INTERNAL_ERROR',
      });
    }
  }

  /**
   * GET /buses/lookup/routes
   */
  async lookupRoutes() {
    try {
      return await this.prisma.transport_routes.findMany({
        select: { id: true, name: true },
        orderBy: { name: 'asc' },
      });
    } catch (err) {
      this.logger.error('DB error while resolving transport routes lookup', err);
      throw new InternalServerErrorException({
        message: 'Something went wrong. Please try again.',
        errorCode: 'INTERNAL_ERROR',
      });
    }
  }

  private async assertRouteExists(routeId: number) {
    let route: unknown;

    try {
      route = await this.prisma.transport_routes.findUnique({ where: { id: routeId } });
    } catch (err) {
      this.logger.error('DB error during transport route lookup', err);
      throw new InternalServerErrorException({
        message: 'Something went wrong. Please try again.',
        errorCode: 'INTERNAL_ERROR',
      });
    }

    if (!route) {
      throw new NotFoundException({
        message: 'Transport route not found',
        errorCode: 'TRANSPORT_ROUTE_NOT_FOUND',
      });
    }
  }

  private async findByVehicleNumber(vehicleNumber: string) {
    try {
      return await this.prisma.buses.findUnique({ where: { vehicle_number: vehicleNumber } });
    } catch (err) {
      this.logger.error('DB error during bus duplicate check', err);
      throw new InternalServerErrorException({
        message: 'Something went wrong. Please try again.',
        errorCode: 'INTERNAL_ERROR',
      });
    }
  }

  private async findById(id: number) {
    try {
      return await this.prisma.buses.findUnique({ where: { id } });
    } catch (err) {
      this.logger.error('DB error during bus lookup', err);
      throw new InternalServerErrorException({
        message: 'Something went wrong. Please try again.',
        errorCode: 'INTERNAL_ERROR',
      });
    }
  }
}
