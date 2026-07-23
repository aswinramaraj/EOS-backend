import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { HallPlansService } from './hall-plans.service';
import { CreateHallPlanDto } from './dto/create-hall-plan.dto';
import { UpdateHallPlanDto } from './dto/update-hall-plan.dto';

@Controller('hall-plans')
export class HallPlansController {
  constructor(private readonly hallPlansService: HallPlansService) {}

  @Post()
  create(@Body() createHallPlanDto: CreateHallPlanDto) {
    return this.hallPlansService.create(createHallPlanDto);
  }

  @Get()
  findAll() {
    return this.hallPlansService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.hallPlansService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateHallPlanDto: UpdateHallPlanDto) {
    return this.hallPlansService.update(+id, updateHallPlanDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.hallPlansService.remove(+id);
  }
}
