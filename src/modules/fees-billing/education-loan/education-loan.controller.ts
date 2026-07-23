import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EducationLoanService } from './education-loan.service';
import { CreateEducationLoanDto } from './dto/create-education-loan.dto';
import { UpdateEducationLoanDto } from './dto/update-education-loan.dto';

@Controller('education-loan')
export class EducationLoanController {
  constructor(private readonly educationLoanService: EducationLoanService) {}

  @Post()
  create(@Body() createEducationLoanDto: CreateEducationLoanDto) {
    return this.educationLoanService.create(createEducationLoanDto);
  }

  @Get()
  findAll() {
    return this.educationLoanService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.educationLoanService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEducationLoanDto: UpdateEducationLoanDto) {
    return this.educationLoanService.update(+id, updateEducationLoanDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.educationLoanService.remove(+id);
  }
}
