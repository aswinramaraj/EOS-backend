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
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';
import { ROLES } from 'src/common/constants/roles.constant';
import { ClassesService } from './classes.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { AssignMentorDto } from './dto/assign-mentor.dto';
import { MentorQueryDto } from './dto/mentor-query.dto';

@Controller('classes')
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Post()
  create(@Body() createClassDto: CreateClassDto) {
    return this.classesService.create(createClassDto);
  }

  @Get()
  findAll() {
    return this.classesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.classesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateClassDto: UpdateClassDto) {
    return this.classesService.update(+id, updateClassDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.classesService.remove(+id);
  }

  /** POST /api/v1/classes/:id/mentor — HoD only, own department. */
  @Post(':id/mentor')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.HOD)
  @HttpCode(HttpStatus.CREATED)
  assignMentor(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AssignMentorDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.classesService.assignMentor(id, dto, user.sub);
  }

  /** PATCH /api/v1/classes/:id/mentor — HoD only, own department. Reassignment. */
  @Patch(':id/mentor')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.HOD)
  reassignMentor(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AssignMentorDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.classesService.reassignMentor(id, dto, user.sub);
  }

  /** GET /api/v1/classes/:id/mentor — Admin/HoD/Faculty. */
  @Get(':id/mentor')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.ADMIN, ROLES.HOD, ROLES.FACULTY)
  getMentor(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: MentorQueryDto,
  ) {
    return this.classesService.getMentor(id, query.academic_year);
  }

  /** DELETE /api/v1/classes/:id/mentor/:academic_year — HoD only, own department. */
  @Delete(':id/mentor/:academic_year')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.HOD)
  removeMentor(
    @Param('id', ParseIntPipe) id: number,
    @Param('academic_year') academicYear: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.classesService.removeMentor(id, academicYear, user.sub);
  }
}
