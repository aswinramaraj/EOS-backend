import { Injectable } from '@nestjs/common';
import { CreateFacultyLeafDto } from './dto/create-faculty-leaf.dto';
import { UpdateFacultyLeafDto } from './dto/update-faculty-leaf.dto';

@Injectable()
export class FacultyLeavesService {
  create(createFacultyLeafDto: CreateFacultyLeafDto) {
    return 'This action adds a new facultyLeaf';
  }

  findAll() {
    return `This action returns all facultyLeaves`;
  }

  findOne(id: number) {
    return `This action returns a #${id} facultyLeaf`;
  }

  update(id: number, updateFacultyLeafDto: UpdateFacultyLeafDto) {
    return `This action updates a #${id} facultyLeaf`;
  }

  remove(id: number) {
    return `This action removes a #${id} facultyLeaf`;
  }
}
