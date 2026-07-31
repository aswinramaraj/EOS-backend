import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { ROLES } from 'src/common/constants/roles.constant';
import { HostelRoomService } from './hostel-room.service';
import { CreateHostelRoomDto } from './dto/create-hostel-room.dto';
import { UpdateHostelRoomDto } from './dto/update-hostel-room.dto';

@Controller('hostel-rooms')
@Roles(ROLES.ADMIN)
@UseGuards(JwtAuthGuard, RolesGuard)
export class HostelRoomController {
  constructor(private readonly hostelRoomService: HostelRoomService) {}

  /**
   * POST /api/v1/hostel-rooms
   *
   * Error responses:
   *  400 VALIDATION_ERROR           – missing/invalid fields
   *  401 UNAUTHORIZED               – missing/invalid access token
   *  403 FORBIDDEN                  – authenticated user is not an admin
   *  404 HOSTEL_ROOM_TYPE_NOT_FOUND – room_type_id does not exist
   *  409 HOSTEL_ROOM_EXISTS         – a room with the same room_number already exists
   *  500 INTERNAL_ERROR             – unexpected server failure
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateHostelRoomDto) {
    return this.hostelRoomService.create(dto);
  }

  /**
   * GET /api/v1/hostel-rooms
   *
   * Error responses:
   *  401 UNAUTHORIZED   – missing/invalid access token
   *  403 FORBIDDEN      – authenticated user is not an admin
   *  500 INTERNAL_ERROR – unexpected server failure
   */
  @Get()
  findAll() {
    return this.hostelRoomService.findAll();
  }

  /**
   * GET /api/v1/hostel-rooms/:id
   *
   * Error responses:
   *  401 UNAUTHORIZED          – missing/invalid access token
   *  403 FORBIDDEN             – authenticated user is not an admin
   *  404 HOSTEL_ROOM_NOT_FOUND – no room with the given id
   *  500 INTERNAL_ERROR        – unexpected server failure
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.hostelRoomService.findOne(id);
  }

  /**
   * PUT /api/v1/hostel-rooms/:id
   *
   * Error responses:
   *  400 VALIDATION_ERROR           – invalid fields
   *  401 UNAUTHORIZED               – missing/invalid access token
   *  403 FORBIDDEN                  – authenticated user is not an admin
   *  404 HOSTEL_ROOM_NOT_FOUND      – no room with the given id
   *  404 HOSTEL_ROOM_TYPE_NOT_FOUND – room_type_id does not exist
   *  409 HOSTEL_ROOM_EXISTS         – another room already uses this room_number
   *  500 INTERNAL_ERROR             – unexpected server failure
   */
  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateHostelRoomDto) {
    return this.hostelRoomService.update(id, dto);
  }

  /**
   * PATCH /api/v1/hostel-rooms/:id
   *
   * Same behaviour as PUT — kept as a separate handler because NestJS route
   * metadata cannot be shared by stacking two HTTP-method decorators on one method.
   *
   * Error responses: see PUT /api/v1/hostel-rooms/:id
   */
  @Patch(':id')
  patch(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateHostelRoomDto) {
    return this.hostelRoomService.update(id, dto);
  }

  /**
   * DELETE /api/v1/hostel-rooms/:id
   *
   * Error responses:
   *  401 UNAUTHORIZED          – missing/invalid access token
   *  403 FORBIDDEN             – authenticated user is not an admin
   *  404 HOSTEL_ROOM_NOT_FOUND – no room with the given id
   *  409 HOSTEL_ROOM_IN_USE    – room is referenced by student_hostel_mapping
   *  500 INTERNAL_ERROR        – unexpected server failure
   */
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.hostelRoomService.remove(id);
  }
}
