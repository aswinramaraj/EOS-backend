import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FacultyMappingService } from './faculty-mapping.service';
import { CreateFacultyMappingDto } from './dto/create-faculty-mapping.dto';
import { UpdateFacultyMappingDto } from './dto/update-faculty-mapping.dto';

@Controller('faculty-mapping')
export class FacultyMappingController {
  constructor(private readonly facultyMappingService: FacultyMappingService) {}

  @Post()
  create(@Body() createFacultyMappingDto: CreateFacultyMappingDto) {
    return this.facultyMappingService.create(createFacultyMappingDto);
  }

  @Get()
  findAll() {
    return this.facultyMappingService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.facultyMappingService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFacultyMappingDto: UpdateFacultyMappingDto) {
    return this.facultyMappingService.update(+id, updateFacultyMappingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.facultyMappingService.remove(+id);
  }
}
