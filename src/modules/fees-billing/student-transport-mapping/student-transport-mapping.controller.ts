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
import { StudentTransportMappingService } from './student-transport-mapping.service';
import { CreateStudentTransportMappingDto } from './dto/create-student-transport-mapping.dto';
import { UpdateStudentTransportMappingDto } from './dto/update-student-transport-mapping.dto';

@Controller('student-transport-mappings')
@Roles(ROLES.ADMIN)
@UseGuards(JwtAuthGuard, RolesGuard)
export class StudentTransportMappingController {
  constructor(private readonly studentTransportMappingService: StudentTransportMappingService) {}

  /**
   * GET /api/v1/student-transport-mappings/lookup/routes
   *
   * Error responses:
   *  401 UNAUTHORIZED   – missing/invalid access token
   *  403 FORBIDDEN      – authenticated user is not an admin
   *  500 INTERNAL_ERROR – unexpected server failure
   */
  @Get('lookup/routes')
  lookupRoutes() {
    return this.studentTransportMappingService.lookupRoutes();
  }

  /**
   * GET /api/v1/student-transport-mappings/lookup/stages?route_id=
   *
   * Error responses:
   *  401 UNAUTHORIZED              – missing/invalid access token
   *  403 FORBIDDEN                 – authenticated user is not an admin
   *  404 TRANSPORT_ROUTE_NOT_FOUND – route_id does not exist
   *  500 INTERNAL_ERROR            – unexpected server failure
   */
  @Get('lookup/stages')
  lookupStages(@Query('route_id', ParseIntPipe) routeId: number) {
    return this.studentTransportMappingService.lookupStages(routeId);
  }

  /**
   * GET /api/v1/student-transport-mappings/lookup/fee-structures
   *
   * Error responses:
   *  401 UNAUTHORIZED   – missing/invalid access token
   *  403 FORBIDDEN      – authenticated user is not an admin
   *  500 INTERNAL_ERROR – unexpected server failure
   */
  @Get('lookup/fee-structures')
  lookupFeeStructures() {
    return this.studentTransportMappingService.lookupFeeStructures();
  }

  /**
   * POST /api/v1/student-transport-mappings
   *
   * Error responses:
   *  400 VALIDATION_ERROR                 – missing/invalid fields
   *  401 UNAUTHORIZED                     – missing/invalid access token
   *  403 FORBIDDEN                        – authenticated user is not an admin
   *  404 STUDENT_NOT_FOUND                – student_id does not exist
   *  404 TRANSPORT_ROUTE_NOT_FOUND        – route_id does not exist
   *  404 TRANSPORT_STAGE_NOT_FOUND        – boarding_stage_id or destination_stage_id does not exist
   *  404 FEE_STRUCTURE_NOT_FOUND          – fee_structure_id does not exist
   *  409 STUDENT_TRANSPORT_MAPPING_EXISTS – student already has a transport mapping
   *  422 STAGE_NOT_ON_ROUTE               – boarding/destination stage does not belong to route_id
   *  422 BOARDING_DESTINATION_STAGE_SAME  – boarding_stage_id equals destination_stage_id
   *  500 INTERNAL_ERROR                   – unexpected server failure
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateStudentTransportMappingDto) {
    return this.studentTransportMappingService.create(dto);
  }

  /**
   * GET /api/v1/student-transport-mappings
   *
   * Error responses:
   *  401 UNAUTHORIZED   – missing/invalid access token
   *  403 FORBIDDEN      – authenticated user is not an admin
   *  500 INTERNAL_ERROR – unexpected server failure
   */
  @Get()
  findAll() {
    return this.studentTransportMappingService.findAll();
  }

  /**
   * GET /api/v1/student-transport-mappings/:id
   *
   * Error responses:
   *  401 UNAUTHORIZED                        – missing/invalid access token
   *  403 FORBIDDEN                           – authenticated user is not an admin
   *  404 STUDENT_TRANSPORT_MAPPING_NOT_FOUND – no mapping with the given id
   *  500 INTERNAL_ERROR                      – unexpected server failure
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.studentTransportMappingService.findOne(id);
  }

  /**
   * PUT /api/v1/student-transport-mappings/:id
   *
   * Error responses:
   *  400 VALIDATION_ERROR                    – invalid fields
   *  401 UNAUTHORIZED                        – missing/invalid access token
   *  403 FORBIDDEN                           – authenticated user is not an admin
   *  404 STUDENT_TRANSPORT_MAPPING_NOT_FOUND – no mapping with the given id
   *  404 STUDENT_NOT_FOUND                   – student_id does not exist
   *  404 TRANSPORT_ROUTE_NOT_FOUND           – route_id does not exist
   *  404 TRANSPORT_STAGE_NOT_FOUND           – boarding_stage_id or destination_stage_id does not exist
   *  404 FEE_STRUCTURE_NOT_FOUND             – fee_structure_id does not exist
   *  409 STUDENT_TRANSPORT_MAPPING_EXISTS    – another mapping already exists for the new student_id
   *  422 STAGE_NOT_ON_ROUTE                  – boarding/destination stage does not belong to the effective route_id
   *  422 BOARDING_DESTINATION_STAGE_SAME     – effective boarding_stage_id equals destination_stage_id
   *  500 INTERNAL_ERROR                      – unexpected server failure
   */
  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateStudentTransportMappingDto) {
    return this.studentTransportMappingService.update(id, dto);
  }

  /**
   * PATCH /api/v1/student-transport-mappings/:id
   *
   * Same behaviour as PUT — kept as a separate handler because NestJS route
   * metadata cannot be shared by stacking two HTTP-method decorators on one method.
   *
   * Error responses: see PUT /api/v1/student-transport-mappings/:id
   */
  @Patch(':id')
  patch(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateStudentTransportMappingDto) {
    return this.studentTransportMappingService.update(id, dto);
  }

  /**
   * DELETE /api/v1/student-transport-mappings/:id
   *
   * Error responses:
   *  401 UNAUTHORIZED                        – missing/invalid access token
   *  403 FORBIDDEN                           – authenticated user is not an admin
   *  404 STUDENT_TRANSPORT_MAPPING_NOT_FOUND – no mapping with the given id
   *  500 INTERNAL_ERROR                      – unexpected server failure
   */
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.studentTransportMappingService.remove(id);
  }
}
