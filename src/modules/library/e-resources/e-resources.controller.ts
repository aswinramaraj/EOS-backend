import {
  Controller,
  Get,
  Query,
  Body,
  Post,
  Patch,
  Param,
  ParseIntPipe,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { EResourcesService } from './e-resources.service';
import { SearchEResourcesDto } from './dto/search-e-resources.dto';
import { CreateEResourceDto } from './dto/create-e-resource.dto';
import { UpdateEResourceDto } from './dto/update-e-resource.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { FuzzySearchDto } from 'src/common';

@Controller('library/e-resources')
export class EResourcesController {
  constructor(private readonly eResourcesService: EResourcesService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Query() query: SearchEResourcesDto) {
    return this.eResourcesService.findAll(query);
  }

  // Must come before ':id' — otherwise Nest would try to match "search" as an :id param.
  @UseGuards(JwtAuthGuard)
  @Get('search')
  searchFuzzy(@Query() query: FuzzySearchDto) {
    return this.eResourcesService.searchFuzzy(query.q, query.limit);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.eResourcesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('library', 'admin')
  @Post()
  create(@Body() dto: CreateEResourceDto) {
    return this.eResourcesService.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('library', 'admin')
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEResourceDto,
  ) {
    return this.eResourcesService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('library', 'admin')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.eResourcesService.remove(id);
  }
}
