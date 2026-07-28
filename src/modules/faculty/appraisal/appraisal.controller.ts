import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AppraisalService } from './appraisal.service';
import { CreateAppraisalDto } from './dto/create-appraisal.dto';
import { UpdateAppraisalDto } from './dto/update-appraisal.dto';

@Controller('appraisal')
export class AppraisalController {
  constructor(private readonly appraisalService: AppraisalService) {}

  @Post()
  create(@Body() createAppraisalDto: CreateAppraisalDto) {
    return this.appraisalService.create(createAppraisalDto);
  }

  @Get()
  findAll() {
    return this.appraisalService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.appraisalService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAppraisalDto: UpdateAppraisalDto,
  ) {
    return this.appraisalService.update(+id, updateAppraisalDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.appraisalService.remove(+id);
  }
}
