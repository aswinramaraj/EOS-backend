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
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';
import { ROLES } from 'src/common/constants/roles.constant';
>>>>>>> c43633224d18a4c76f422fa4859990192aed2664
import { FacultyMappingService } from './faculty-mapping.service';
import { CreateFacultyMappingDto } from './dto/create-faculty-mapping.dto';
import { UpdateFacultyMappingDto } from './dto/update-faculty-mapping.dto';
import { ListFacultyMappingQueryDto } from './dto/list-faculty-mapping-query.dto';

@Controller('me')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FacultyMappingController {
  constructor(private readonly facultyMappingService: FacultyMappingService) {}

  /** POST /api/v1/faculty-mapping — HoD only. */
  @Post('faculty-mapping')
  @Roles(ROLES.HOD)
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() dto: CreateFacultyMappingDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.facultyMappingService.create(dto, user.sub);
  }

  /** GET /api/v1/faculty-mapping — Admin/HoD/Faculty. Paginated, optionally filtered. */
  @Get('faculty-mapping')
  @Roles(ROLES.ADMIN, ROLES.HOD, ROLES.FACULTY)
  findAll(@Query() query: ListFacultyMappingQueryDto) {
    return this.facultyMappingService.findAll(query);
  }

  /** GET /api/v1/faculty-mapping/:id — Admin/HoD/Faculty. */
  @Get('faculty-mapping/:id')
  @Roles(ROLES.ADMIN, ROLES.HOD, ROLES.FACULTY)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.facultyMappingService.findOne(id);
  }

<<<<<<< HEAD
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateFacultyMappingDto: UpdateFacultyMappingDto,
  ) {
    return this.facultyMappingService.update(+id, updateFacultyMappingDto);
=======
  /** PATCH /api/v1/faculty-mapping/:id — HoD only, own department. */
  @Patch('faculty-mapping/:id')
  @Roles(ROLES.HOD)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateFacultyMappingDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.facultyMappingService.update(id, dto, user.sub);
>>>>>>> c43633224d18a4c76f422fa4859990192aed2664
  }

  /**
   * DELETE /api/v1/faculty-mapping/:id — HoD only, own department.
   * Hard delete (no soft-delete column on this table).
   */
  @Delete('faculty-mapping/:id')
  @Roles(ROLES.HOD)
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.facultyMappingService.remove(id, user.sub);
  }
}
