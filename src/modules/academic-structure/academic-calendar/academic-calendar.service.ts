import { Injectable } from '@nestjs/common';
import { CreateAcademicCalendarDto } from './dto/create-academic-calendar.dto';
import { UpdateAcademicCalendarDto } from './dto/update-academic-calendar.dto';

@Injectable()
export class AcademicCalendarService {
  create(createAcademicCalendarDto: CreateAcademicCalendarDto) {
    return 'This action adds a new academicCalendar';
  }

  findAll() {
    return `This action returns all academicCalendar`;
  }

  findOne(id: number) {
    return `This action returns a #${id} academicCalendar`;
  }

  update(id: number, updateAcademicCalendarDto: UpdateAcademicCalendarDto) {
    return `This action updates a #${id} academicCalendar`;
  }

  remove(id: number) {
    return `This action removes a #${id} academicCalendar`;
  }
}
