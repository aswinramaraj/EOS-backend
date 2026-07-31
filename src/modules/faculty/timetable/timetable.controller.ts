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
import { ROLES } from 'src/common/constants/roles.constant';
>>>>>>> c43633224d18a4c76f422fa4859990192aed2664
import { TimetableService } from './timetable.service';
import { CreateTimetableDto } from './dto/create-timetable.dto';
import { UpdateTimetableDto } from './dto/update-timetable.dto';
import { ListTimetableQueryDto } from './dto/list-timetable-query.dto';

@Controller('me')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TimetableController {
  constructor(private readonly timetableService: TimetableService) {}

  /** POST /api/v1/timetable — HoD only. */
  @Post('timetable-slots')
  @Roles(ROLES.HOD)
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateTimetableDto) {
    return this.timetableService.create(dto);
  }

  /** GET /api/v1/timetable — Admin/HoD/Faculty/Student. Paginated, filterable. */
  @Get('timetable-slots')
  @Roles(ROLES.ADMIN, ROLES.HOD, ROLES.FACULTY, ROLES.STUDENT)
  findAll(@Query() query: ListTimetableQueryDto) {
    return this.timetableService.findAll(query);
  }

  /** GET /api/v1/timetable/:id — Admin/HoD/Faculty/Student. */
  @Get('timetable-slots/:id')
  @Roles(ROLES.ADMIN, ROLES.HOD, ROLES.FACULTY, ROLES.STUDENT)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.timetableService.findOne(id);
  }

<<<<<<< HEAD
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTimetableDto: UpdateTimetableDto,
  ) {
    return this.timetableService.update(+id, updateTimetableDto);
=======
  /** PATCH /api/v1/timetable/:id — HoD only. */
  @Patch('timetable-slots/:id')
  @Roles(ROLES.HOD)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTimetableDto,
  ) {
    return this.timetableService.update(id, dto);
>>>>>>> c43633224d18a4c76f422fa4859990192aed2664
  }

  /** DELETE /api/v1/timetable/:id — HoD only. Hard delete (no soft-delete column on this table). */
  @Delete('timetable-slots/:id')
  @Roles(ROLES.HOD)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.timetableService.remove(id);
  }
}
