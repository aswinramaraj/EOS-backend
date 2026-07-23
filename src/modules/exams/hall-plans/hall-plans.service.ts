import { Injectable } from '@nestjs/common';
import { CreateHallPlanDto } from './dto/create-hall-plan.dto';
import { UpdateHallPlanDto } from './dto/update-hall-plan.dto';

@Injectable()
export class HallPlansService {
  create(createHallPlanDto: CreateHallPlanDto) {
    return 'This action adds a new hallPlan';
  }

  findAll() {
    return `This action returns all hallPlans`;
  }

  findOne(id: number) {
    return `This action returns a #${id} hallPlan`;
  }

  update(id: number, updateHallPlanDto: UpdateHallPlanDto) {
    return `This action updates a #${id} hallPlan`;
  }

  remove(id: number) {
    return `This action removes a #${id} hallPlan`;
  }
}
