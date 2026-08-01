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
import { StudentHostelMappingsService } from './student-hostel-mappings.service';
import { CreateStudentHostelMappingDto } from './dto/create-student-hostel-mapping.dto';
import { UpdateStudentHostelMappingDto } from './dto/update-student-hostel-mapping.dto';

@Controller('student-hostel-mappings')
@Roles(ROLES.ADMIN)
@UseGuards(JwtAuthGuard, RolesGuard)
export class StudentHostelMappingsController {
  constructor(private readonly studentHostelMappingsService: StudentHostelMappingsService) {}

  /**
   * GET /api/v1/student-hostel-mappings/lookup/rooms
   *
   * Error responses:
   *  401 UNAUTHORIZED   – missing/invalid access token
   *  403 FORBIDDEN      – authenticated user is not an admin
   *  500 INTERNAL_ERROR – unexpected server failure
   */
  @Get('lookup/rooms')
  lookupRooms() {
    return this.studentHostelMappingsService.lookupRooms();
  }

  /**
   * GET /api/v1/student-hostel-mappings/lookup/fee-structures
   *
   * Error responses:
   *  401 UNAUTHORIZED   – missing/invalid access token
   *  403 FORBIDDEN      – authenticated user is not an admin
   *  500 INTERNAL_ERROR – unexpected server failure
   */
  @Get('lookup/fee-structures')
  lookupFeeStructures() {
    return this.studentHostelMappingsService.lookupFeeStructures();
  }

  /**
   * POST /api/v1/student-hostel-mappings
   *
   * Error responses:
   *  400 VALIDATION_ERROR               – missing/invalid fields
   *  401 UNAUTHORIZED                   – missing/invalid access token
   *  403 FORBIDDEN                      – authenticated user is not an admin
   *  404 STUDENT_NOT_FOUND              – student_id does not exist
   *  404 HOSTEL_ROOM_NOT_FOUND          – room_id does not exist
   *  404 FEE_STRUCTURE_NOT_FOUND        – fee_structure_id does not exist
   *  409 STUDENT_HOSTEL_MAPPING_EXISTS  – student already has a hostel mapping
   *  500 INTERNAL_ERROR                 – unexpected server failure
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateStudentHostelMappingDto) {
    return this.studentHostelMappingsService.create(dto);
  }

  /**
   * GET /api/v1/student-hostel-mappings
   *
   * Error responses:
   *  401 UNAUTHORIZED   – missing/invalid access token
   *  403 FORBIDDEN      – authenticated user is not an admin
   *  500 INTERNAL_ERROR – unexpected server failure
   */
  @Get()
  findAll() {
    return this.studentHostelMappingsService.findAll();
  }

  /**
   * GET /api/v1/student-hostel-mappings/:id
   *
   * Error responses:
   *  401 UNAUTHORIZED                     – missing/invalid access token
   *  403 FORBIDDEN                        – authenticated user is not an admin
   *  404 STUDENT_HOSTEL_MAPPING_NOT_FOUND – no mapping with the given id
   *  500 INTERNAL_ERROR                   – unexpected server failure
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.studentHostelMappingsService.findOne(id);
  }

  /**
   * PUT /api/v1/student-hostel-mappings/:id
   *
   * Error responses:
   *  400 VALIDATION_ERROR                 – invalid fields
   *  401 UNAUTHORIZED                     – missing/invalid access token
   *  403 FORBIDDEN                        – authenticated user is not an admin
   *  404 STUDENT_HOSTEL_MAPPING_NOT_FOUND – no mapping with the given id
   *  404 STUDENT_NOT_FOUND                – student_id does not exist
   *  404 HOSTEL_ROOM_NOT_FOUND            – room_id does not exist
   *  404 FEE_STRUCTURE_NOT_FOUND          – fee_structure_id does not exist
   *  409 STUDENT_HOSTEL_MAPPING_EXISTS    – another mapping already exists for the new student_id
   *  500 INTERNAL_ERROR                   – unexpected server failure
   */
  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateStudentHostelMappingDto) {
    return this.studentHostelMappingsService.update(id, dto);
  }

  /**
   * PATCH /api/v1/student-hostel-mappings/:id
   *
   * Same behaviour as PUT — kept as a separate handler because NestJS route
   * metadata cannot be shared by stacking two HTTP-method decorators on one method.
   *
   * Error responses: see PUT /api/v1/student-hostel-mappings/:id
   */
  @Patch(':id')
  patch(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateStudentHostelMappingDto) {
    return this.studentHostelMappingsService.update(id, dto);
  }

  /**
   * DELETE /api/v1/student-hostel-mappings/:id
   *
   * Error responses:
   *  401 UNAUTHORIZED                     – missing/invalid access token
   *  403 FORBIDDEN                        – authenticated user is not an admin
   *  404 STUDENT_HOSTEL_MAPPING_NOT_FOUND – no mapping with the given id
   *  500 INTERNAL_ERROR                   – unexpected server failure
   */
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.studentHostelMappingsService.remove(id);
  }
}
