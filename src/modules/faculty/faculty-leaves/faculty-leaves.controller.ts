import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { FacultyLeavesService } from './faculty-leaves.service';
import { CreateFacultyLeafDto } from './dto/create-faculty-leaf.dto';
import { UpdateFacultyLeafDto } from './dto/update-faculty-leaf.dto';

@Controller('faculty-leaves')
export class FacultyLeavesController {
  constructor(private readonly facultyLeavesService: FacultyLeavesService) {}

  @Post()
  create(@Body() createFacultyLeafDto: CreateFacultyLeafDto) {
    return this.facultyLeavesService.create(createFacultyLeafDto);
  }

  @Get()
  findAll() {
    return this.facultyLeavesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.facultyLeavesService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateFacultyLeafDto: UpdateFacultyLeafDto,
  ) {
    return this.facultyLeavesService.update(+id, updateFacultyLeafDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.facultyLeavesService.remove(+id);
  }
}
