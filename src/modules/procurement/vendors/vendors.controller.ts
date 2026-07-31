import {
<<<<<<< HEAD
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
=======
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
>>>>>>> c43633224d18a4c76f422fa4859990192aed2664
import { VendorsService } from './vendors.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';

@Controller('vendors')
@Roles(ROLES.ADMIN)
@UseGuards(JwtAuthGuard, RolesGuard)
export class VendorsController {
  constructor(private readonly vendorsService: VendorsService) {}

  /**
   * POST /api/v1/vendors
   *
   * Error responses:
   *  400 VALIDATION_ERROR – missing/invalid fields
   *  401 UNAUTHORIZED     – missing/invalid access token
   *  403 FORBIDDEN        – authenticated user is not an admin
   *  500 INTERNAL_ERROR   – unexpected server failure
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateVendorDto) {
    return this.vendorsService.create(dto);
  }

  /**
   * GET /api/v1/vendors
   *
   * Error responses:
   *  401 UNAUTHORIZED   – missing/invalid access token
   *  403 FORBIDDEN      – authenticated user is not an admin
   *  500 INTERNAL_ERROR – unexpected server failure
   */
  @Get()
  findAll() {
    return this.vendorsService.findAll();
  }

  /**
   * GET /api/v1/vendors/:id
   *
   * Error responses:
   *  401 UNAUTHORIZED     – missing/invalid access token
   *  403 FORBIDDEN        – authenticated user is not an admin
   *  404 VENDOR_NOT_FOUND – no vendor with the given id
   *  500 INTERNAL_ERROR   – unexpected server failure
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.vendorsService.findOne(id);
  }

  /**
   * PUT /api/v1/vendors/:id
   *
   * Error responses:
   *  400 VALIDATION_ERROR – invalid fields
   *  401 UNAUTHORIZED     – missing/invalid access token
   *  403 FORBIDDEN        – authenticated user is not an admin
   *  404 VENDOR_NOT_FOUND – no vendor with the given id
   *  500 INTERNAL_ERROR   – unexpected server failure
   */
  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateVendorDto) {
    return this.vendorsService.update(id, dto);
  }

  /**
   * PATCH /api/v1/vendors/:id
   *
   * Same behaviour as PUT — kept as a separate handler because NestJS route
   * metadata cannot be shared by stacking two HTTP-method decorators on one method.
   *
   * Error responses: see PUT /api/v1/vendors/:id
   */
  @Patch(':id')
  patch(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateVendorDto) {
    return this.vendorsService.update(id, dto);
  }

  /**
   * DELETE /api/v1/vendors/:id
   *
   * Error responses:
   *  401 UNAUTHORIZED     – missing/invalid access token
   *  403 FORBIDDEN        – authenticated user is not an admin
   *  404 VENDOR_NOT_FOUND – no vendor with the given id
   *  409 VENDOR_IN_USE    – vendor is referenced by purchase_order_proposals, service_order_proposals or vendor_quotations
   *  500 INTERNAL_ERROR   – unexpected server failure
   */
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.vendorsService.remove(id);
  }
}
