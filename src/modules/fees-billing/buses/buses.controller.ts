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
import { BusesService } from './buses.service';
import { CreateBusDto } from './dto/create-bus.dto';
import { UpdateBusDto } from './dto/update-bus.dto';

@Controller('buses')
@Roles(ROLES.ADMIN)
@UseGuards(JwtAuthGuard, RolesGuard)
export class BusesController {
  constructor(private readonly busesService: BusesService) {}

  /**
   * POST /api/v1/buses
   *
   * Error responses:
   *  400 VALIDATION_ERROR          – missing/invalid fields
   *  401 UNAUTHORIZED              – missing/invalid access token
   *  403 FORBIDDEN                 – authenticated user is not an admin
   *  404 TRANSPORT_ROUTE_NOT_FOUND – route_id does not exist
   *  409 BUS_VEHICLE_NUMBER_EXISTS – a bus with the same vehicle_number already exists
   *  409 BUS_NO_EXISTS             – a bus with the same bus_no already exists
   *  500 INTERNAL_ERROR            – unexpected server failure
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateBusDto) {
    return this.busesService.create(dto);
  }

  /**
   * GET /api/v1/buses/lookup/routes
   *
   * Error responses:
   *  401 UNAUTHORIZED   – missing/invalid access token
   *  403 FORBIDDEN      – authenticated user is not an admin
   *  500 INTERNAL_ERROR – unexpected server failure
   */
  @Get('lookup/routes')
  lookupRoutes() {
    return this.busesService.lookupRoutes();
  }

  /**
   * GET /api/v1/buses
   *
   * Error responses:
   *  401 UNAUTHORIZED   – missing/invalid access token
   *  403 FORBIDDEN      – authenticated user is not an admin
   *  500 INTERNAL_ERROR – unexpected server failure
   */
  @Get()
  findAll() {
    return this.busesService.findAll();
  }

  /**
   * GET /api/v1/buses/:id
   *
   * Error responses:
   *  401 UNAUTHORIZED   – missing/invalid access token
   *  403 FORBIDDEN      – authenticated user is not an admin
   *  404 BUS_NOT_FOUND  – no bus with the given id
   *  500 INTERNAL_ERROR – unexpected server failure
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.busesService.findOne(id);
  }

  /**
   * PUT /api/v1/buses/:id
   *
   * Error responses:
   *  400 VALIDATION_ERROR          – invalid fields
   *  401 UNAUTHORIZED              – missing/invalid access token
   *  403 FORBIDDEN                 – authenticated user is not an admin
   *  404 BUS_NOT_FOUND             – no bus with the given id
   *  404 TRANSPORT_ROUTE_NOT_FOUND – route_id does not exist
   *  409 BUS_VEHICLE_NUMBER_EXISTS – another bus already uses this vehicle_number
   *  409 BUS_NO_EXISTS             – another bus already uses this bus_no
   *  500 INTERNAL_ERROR            – unexpected server failure
   */
  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBusDto) {
    return this.busesService.update(id, dto);
  }

  /**
   * PATCH /api/v1/buses/:id
   *
   * Same behaviour as PUT — kept as a separate handler because NestJS route
   * metadata cannot be shared by stacking two HTTP-method decorators on one method.
   *
   * Error responses: see PUT /api/v1/buses/:id
   */
  @Patch(':id')
  patch(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBusDto) {
    return this.busesService.update(id, dto);
  }

  /**
   * DELETE /api/v1/buses/:id
   *
   * Error responses:
   *  401 UNAUTHORIZED   – missing/invalid access token
   *  403 FORBIDDEN      – authenticated user is not an admin
   *  404 BUS_NOT_FOUND  – no bus with the given id
   *  409 BUS_IN_USE     – bus is referenced by bus_live_locations
   *  500 INTERNAL_ERROR – unexpected server failure
   */
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.busesService.remove(id);
  }
}
