import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RacksService } from './racks.service';
import { CreateRackDto } from './dto/create-rack.dto';
import { UpdateRackDto } from './dto/update-rack.dto';
import { SearchRacksDto } from './dto/search-racks.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('library/racks')
export class RacksController {
  constructor(private readonly racksService: RacksService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Query() query: SearchRacksDto) {
    return this.racksService.findAll(query);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.racksService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('library', 'admin')
  create(@Body() dto: CreateRackDto) {
    return this.racksService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('library', 'admin')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRackDto) {
    return this.racksService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('library', 'admin')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.racksService.remove(id);
  }
}
