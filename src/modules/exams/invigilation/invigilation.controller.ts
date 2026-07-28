import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { InvigilationService } from './invigilation.service';
import { CreateInvigilationDto } from './dto/create-invigilation.dto';
import { UpdateInvigilationDto } from './dto/update-invigilation.dto';

@Controller('invigilation')
export class InvigilationController {
  constructor(private readonly invigilationService: InvigilationService) {}

  @Post()
  create(@Body() createInvigilationDto: CreateInvigilationDto) {
    return this.invigilationService.create(createInvigilationDto);
  }

  @Get()
  findAll() {
    return this.invigilationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.invigilationService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateInvigilationDto: UpdateInvigilationDto,
  ) {
    return this.invigilationService.update(+id, updateInvigilationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.invigilationService.remove(+id);
  }
}
