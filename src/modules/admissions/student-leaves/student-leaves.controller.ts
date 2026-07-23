import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { StudentLeavesService } from './student-leaves.service';
import { CreateStudentLeafDto } from './dto/create-student-leaf.dto';
import { UpdateStudentLeafDto } from './dto/update-student-leaf.dto';

@Controller('student-leaves')
export class StudentLeavesController {
  constructor(private readonly studentLeavesService: StudentLeavesService) {}

  @Post()
  create(@Body() createStudentLeafDto: CreateStudentLeafDto) {
    return this.studentLeavesService.create(createStudentLeafDto);
  }

  @Get()
  findAll() {
    return this.studentLeavesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.studentLeavesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStudentLeafDto: UpdateStudentLeafDto) {
    return this.studentLeavesService.update(+id, updateStudentLeafDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.studentLeavesService.remove(+id);
  }
}
