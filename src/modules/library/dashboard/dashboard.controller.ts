import { Controller, Get, UseGuards } from '@nestjs/common';
import { LibraryDashboardService } from './dashboard.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('library/dashboard')
export class LibraryDashboardController {
  constructor(private readonly dashboardService: LibraryDashboardService) {}

  @Get('summary')
  @UseGuards(JwtAuthGuard)
  summary() {
    return this.dashboardService.summary();
  }
}
