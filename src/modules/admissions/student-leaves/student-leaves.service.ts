import { Injectable } from '@nestjs/common';
import { CreateStudentLeafDto } from './dto/create-student-leaf.dto';
import { UpdateStudentLeafDto } from './dto/update-student-leaf.dto';

@Injectable()
export class StudentLeavesService {
  create(createStudentLeafDto: CreateStudentLeafDto) {
    return 'This action adds a new studentLeaf';
  }

  findAll() {
    return `This action returns all studentLeaves`;
  }

  findOne(id: number) {
    return `This action returns a #${id} studentLeaf`;
  }

  update(id: number, updateStudentLeafDto: UpdateStudentLeafDto) {
    return `This action updates a #${id} studentLeaf`;
  }

  remove(id: number) {
    return `This action removes a #${id} studentLeaf`;
  }
}
