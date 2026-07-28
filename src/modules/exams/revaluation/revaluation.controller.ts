import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { RevaluationService } from './revaluation.service';
import { CreateRevaluationDto } from './dto/create-revaluation.dto';
import { UpdateRevaluationDto } from './dto/update-revaluation.dto';

@Controller('revaluation')
export class RevaluationController {
  constructor(private readonly revaluationService: RevaluationService) {}

  @Post()
  create(@Body() createRevaluationDto: CreateRevaluationDto) {
    return this.revaluationService.create(createRevaluationDto);
  }

  @Get()
  findAll() {
    return this.revaluationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.revaluationService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateRevaluationDto: UpdateRevaluationDto,
  ) {
    return this.revaluationService.update(+id, updateRevaluationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.revaluationService.remove(+id);
  }
}
