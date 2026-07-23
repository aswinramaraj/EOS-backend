import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { LmsNotesService } from './lms-notes.service';
import { CreateLmsNoteDto } from './dto/create-lms-note.dto';
import { UpdateLmsNoteDto } from './dto/update-lms-note.dto';

@Controller('lms-notes')
export class LmsNotesController {
  constructor(private readonly lmsNotesService: LmsNotesService) {}

  @Post()
  create(@Body() createLmsNoteDto: CreateLmsNoteDto) {
    return this.lmsNotesService.create(createLmsNoteDto);
  }

  @Get()
  findAll() {
    return this.lmsNotesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.lmsNotesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLmsNoteDto: UpdateLmsNoteDto) {
    return this.lmsNotesService.update(+id, updateLmsNoteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.lmsNotesService.remove(+id);
  }
}
