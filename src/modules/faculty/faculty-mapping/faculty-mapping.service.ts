import { Injectable } from '@nestjs/common';
import { CreateFacultyMappingDto } from './dto/create-faculty-mapping.dto';
import { UpdateFacultyMappingDto } from './dto/update-faculty-mapping.dto';

@Injectable()
export class FacultyMappingService {
  create(createFacultyMappingDto: CreateFacultyMappingDto) {
    return 'This action adds a new facultyMapping';
  }

  findAll() {
    return `This action returns all facultyMapping`;
  }

  findOne(id: number) {
    return `This action returns a #${id} facultyMapping`;
  }

  update(id: number, updateFacultyMappingDto: UpdateFacultyMappingDto) {
    return `This action updates a #${id} facultyMapping`;
  }

  remove(id: number) {
    return `This action removes a #${id} facultyMapping`;
  }
}
