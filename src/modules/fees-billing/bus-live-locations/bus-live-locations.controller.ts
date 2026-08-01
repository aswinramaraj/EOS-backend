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
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { ROLES } from 'src/common/constants/roles.constant';
import { BusLiveLocationsService } from './bus-live-locations.service';
import { CreateBusLiveLocationDto } from './dto/create-bus-live-location.dto';
import { UpdateBusLiveLocationDto } from './dto/update-bus-live-location.dto';

@Controller('bus-live-locations')
@Roles(ROLES.ADMIN)
@UseGuards(JwtAuthGuard, RolesGuard)
export class BusLiveLocationsController {
  constructor(private readonly busLiveLocationsService: BusLiveLocationsService) {}

  /**
   * POST /api/v1/bus-live-locations
   *
   * Error responses:
   *  400 VALIDATION_ERROR – missing/invalid fields
   *  401 UNAUTHORIZED     – missing/invalid access token
   *  403 FORBIDDEN        – authenticated user is not an admin
   *  404 BUS_NOT_FOUND    – bus_id does not exist
   *  500 INTERNAL_ERROR   – unexpected server failure
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateBusLiveLocationDto) {
    return this.busLiveLocationsService.create(dto);
  }

  /**
   * GET /api/v1/bus-live-locations
   * GET /api/v1/bus-live-locations?bus_id=
   *
   * Error responses:
   *  401 UNAUTHORIZED   – missing/invalid access token
   *  403 FORBIDDEN      – authenticated user is not an admin
   *  500 INTERNAL_ERROR – unexpected server failure
   */
  @Get()
  findAll(@Query('bus_id', new ParseIntPipe({ optional: true })) busId?: number) {
    return this.busLiveLocationsService.findAll(busId);
  }

  /**
   * GET /api/v1/bus-live-locations/:id
   *
   * Error responses:
   *  401 UNAUTHORIZED                – missing/invalid access token
   *  403 FORBIDDEN                   – authenticated user is not an admin
   *  404 BUS_LIVE_LOCATION_NOT_FOUND – no record with the given id
   *  500 INTERNAL_ERROR              – unexpected server failure
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.busLiveLocationsService.findOne(id);
  }

  /**
   * PUT /api/v1/bus-live-locations/:id
   *
   * Error responses:
   *  400 VALIDATION_ERROR            – invalid fields
   *  401 UNAUTHORIZED                – missing/invalid access token
   *  403 FORBIDDEN                   – authenticated user is not an admin
   *  404 BUS_LIVE_LOCATION_NOT_FOUND – no record with the given id
   *  404 BUS_NOT_FOUND               – bus_id does not exist
   *  500 INTERNAL_ERROR              – unexpected server failure
   */
  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBusLiveLocationDto) {
    return this.busLiveLocationsService.update(id, dto);
  }

  /**
   * PATCH /api/v1/bus-live-locations/:id
   *
   * Same behaviour as PUT — kept as a separate handler because NestJS route
   * metadata cannot be shared by stacking two HTTP-method decorators on one method.
   *
   * Error responses: see PUT /api/v1/bus-live-locations/:id
   */
  @Patch(':id')
  patch(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBusLiveLocationDto) {
    return this.busLiveLocationsService.update(id, dto);
  }

  /**
   * DELETE /api/v1/bus-live-locations/:id
   *
   * Error responses:
   *  401 UNAUTHORIZED                – missing/invalid access token
   *  403 FORBIDDEN                   – authenticated user is not an admin
   *  404 BUS_LIVE_LOCATION_NOT_FOUND – no record with the given id
   *  500 INTERNAL_ERROR              – unexpected server failure
   */
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.busLiveLocationsService.remove(id);
  }
}
