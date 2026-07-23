import { Injectable } from '@nestjs/common';
import { CreateEducationLoanDto } from './dto/create-education-loan.dto';
import { UpdateEducationLoanDto } from './dto/update-education-loan.dto';

@Injectable()
export class EducationLoanService {
  create(createEducationLoanDto: CreateEducationLoanDto) {
    return 'This action adds a new educationLoan';
  }

  findAll() {
    return `This action returns all educationLoan`;
  }

  findOne(id: number) {
    return `This action returns a #${id} educationLoan`;
  }

  update(id: number, updateEducationLoanDto: UpdateEducationLoanDto) {
    return `This action updates a #${id} educationLoan`;
  }

  remove(id: number) {
    return `This action removes a #${id} educationLoan`;
  }
}
