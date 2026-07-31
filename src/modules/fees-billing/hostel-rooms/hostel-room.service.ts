import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateHostelRoomDto } from './dto/create-hostel-room.dto';
import { UpdateHostelRoomDto } from './dto/update-hostel-room.dto';

@Injectable()
export class HostelRoomService {
  private readonly logger = new Logger(HostelRoomService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * POST /hostel-rooms
   *
   * Error cases:
   *  404 HOSTEL_ROOM_TYPE_NOT_FOUND – room_type_id does not exist
   *  409 HOSTEL_ROOM_EXISTS         – a room with the same room_number already exists
   *  500 INTERNAL_ERROR             – unexpected failure (DB, etc.)
   */
  async create(dto: CreateHostelRoomDto) {
    await this.assertRoomTypeExists(dto.room_type_id);

    const existing = await this.findByRoomNumber(dto.room_number);

    if (existing) {
      throw new ConflictException({
        message: 'A hostel room with this room number already exists',
        errorCode: 'HOSTEL_ROOM_EXISTS',
      });
    }

    try {
      return await this.prisma.hostel_rooms.create({
        data: {
          room_number: dto.room_number,
          room_type_id: dto.room_type_id,
          capacity: dto.capacity,
        },
      });
    } catch (err) {
      this.logger.error('DB error while creating hostel room', err);
      throw new InternalServerErrorException({
        message: 'Something went wrong. Please try again.',
        errorCode: 'INTERNAL_ERROR',
      });
    }
  }

  /**
   * GET /hostel-rooms
   */
  async findAll() {
    try {
      return await this.prisma.hostel_rooms.findMany({
        orderBy: { room_number: 'asc' },
      });
    } catch (err) {
      this.logger.error('DB error while fetching hostel rooms', err);
      throw new InternalServerErrorException({
        message: 'Something went wrong. Please try again.',
        errorCode: 'INTERNAL_ERROR',
      });
    }
  }

  /**
   * GET /hostel-rooms/:id
   *
   * Error cases:
   *  404 HOSTEL_ROOM_NOT_FOUND – no room with the given id
   */
  async findOne(id: number) {
    const room = await this.findById(id);

    if (!room) {
      throw new NotFoundException({
        message: 'Hostel room not found',
        errorCode: 'HOSTEL_ROOM_NOT_FOUND',
      });
    }

    return room;
  }

  /**
   * PUT/PATCH /hostel-rooms/:id
   *
   * Error cases:
   *  404 HOSTEL_ROOM_NOT_FOUND      – no room with the given id
   *  404 HOSTEL_ROOM_TYPE_NOT_FOUND – room_type_id does not exist
   *  409 HOSTEL_ROOM_EXISTS         – another room already uses this room_number
   */
  async update(id: number, dto: UpdateHostelRoomDto) {
    const room = await this.findById(id);

    if (!room) {
      throw new NotFoundException({
        message: 'Hostel room not found',
        errorCode: 'HOSTEL_ROOM_NOT_FOUND',
      });
    }

    if (dto.room_type_id) {
      await this.assertRoomTypeExists(dto.room_type_id);
    }

    if (dto.room_number) {
      const existing = await this.findByRoomNumber(dto.room_number);

      if (existing && existing.id !== id) {
        throw new ConflictException({
          message: 'A hostel room with this room number already exists',
          errorCode: 'HOSTEL_ROOM_EXISTS',
        });
      }
    }

    try {
      return await this.prisma.hostel_rooms.update({
        where: { id },
        data: {
          room_number: dto.room_number,
          room_type_id: dto.room_type_id,
          capacity: dto.capacity,
        },
      });
    } catch (err) {
      this.logger.error('DB error while updating hostel room', err);
      throw new InternalServerErrorException({
        message: 'Something went wrong. Please try again.',
        errorCode: 'INTERNAL_ERROR',
      });
    }
  }

  /**
   * DELETE /hostel-rooms/:id
   *
   * Error cases:
   *  404 HOSTEL_ROOM_NOT_FOUND – no room with the given id
   *  409 HOSTEL_ROOM_IN_USE    – room is referenced by student_hostel_mapping
   */
  async remove(id: number) {
    const room = await this.findById(id);

    if (!room) {
      throw new NotFoundException({
        message: 'Hostel room not found',
        errorCode: 'HOSTEL_ROOM_NOT_FOUND',
      });
    }

    let usageCount: number;

    try {
      usageCount = await this.prisma.student_hostel_mapping.count({
        where: { room_id: id },
      });
    } catch (err) {
      this.logger.error('DB error while checking hostel room usage', err);
      throw new InternalServerErrorException({
        message: 'Something went wrong. Please try again.',
        errorCode: 'INTERNAL_ERROR',
      });
    }

    if (usageCount > 0) {
      throw new ConflictException({
        message: 'This hostel room is in use and cannot be deleted',
        errorCode: 'HOSTEL_ROOM_IN_USE',
      });
    }

    try {
      return await this.prisma.hostel_rooms.delete({
        where: { id },
      });
    } catch (err) {
      this.logger.error('DB error while deleting hostel room', err);
      throw new InternalServerErrorException({
        message: 'Something went wrong. Please try again.',
        errorCode: 'INTERNAL_ERROR',
      });
    }
  }

  private async assertRoomTypeExists(roomTypeId: number) {
    let roomType: unknown;

    try {
      roomType = await this.prisma.hostel_room_types.findUnique({ where: { id: roomTypeId } });
    } catch (err) {
      this.logger.error('DB error during hostel room type lookup', err);
      throw new InternalServerErrorException({
        message: 'Something went wrong. Please try again.',
        errorCode: 'INTERNAL_ERROR',
      });
    }

    if (!roomType) {
      throw new NotFoundException({
        message: 'Hostel room type not found',
        errorCode: 'HOSTEL_ROOM_TYPE_NOT_FOUND',
      });
    }
  }

  private async findByRoomNumber(roomNumber: string) {
    try {
      return await this.prisma.hostel_rooms.findUnique({ where: { room_number: roomNumber } });
    } catch (err) {
      this.logger.error('DB error during hostel room duplicate check', err);
      throw new InternalServerErrorException({
        message: 'Something went wrong. Please try again.',
        errorCode: 'INTERNAL_ERROR',
      });
    }
  }

  private async findById(id: number) {
    try {
      return await this.prisma.hostel_rooms.findUnique({ where: { id } });
    } catch (err) {
      this.logger.error('DB error during hostel room lookup', err);
      throw new InternalServerErrorException({
        message: 'Something went wrong. Please try again.',
        errorCode: 'INTERNAL_ERROR',
      });
    }
  }
}
