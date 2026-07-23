import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { StudentProfilesService } from './student-profiles.service';
import { CreateStudentProfileDto } from './dto/create-student-profile.dto';
import { UpdateStudentProfileDto } from './dto/update-student-profile.dto';

@Controller('student-profiles')
export class StudentProfilesController {
  constructor(private readonly studentProfilesService: StudentProfilesService) {}

  @Post()
  create(@Body() createStudentProfileDto: CreateStudentProfileDto) {
    return this.studentProfilesService.create(createStudentProfileDto);
  }

  @Get()
  findAll() {
    return this.studentProfilesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.studentProfilesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStudentProfileDto: UpdateStudentProfileDto) {
    return this.studentProfilesService.update(+id, updateStudentProfileDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.studentProfilesService.remove(+id);
  }
}
