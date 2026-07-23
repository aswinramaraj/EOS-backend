import { Injectable } from '@nestjs/common';
import { CreateLmsNoteDto } from './dto/create-lms-note.dto';
import { UpdateLmsNoteDto } from './dto/update-lms-note.dto';

@Injectable()
export class LmsNotesService {
  create(createLmsNoteDto: CreateLmsNoteDto) {
    return 'This action adds a new lmsNote';
  }

  findAll() {
    return `This action returns all lmsNotes`;
  }

  findOne(id: number) {
    return `This action returns a #${id} lmsNote`;
  }

  update(id: number, updateLmsNoteDto: UpdateLmsNoteDto) {
    return `This action updates a #${id} lmsNote`;
  }

  remove(id: number) {
    return `This action removes a #${id} lmsNote`;
  }
}
