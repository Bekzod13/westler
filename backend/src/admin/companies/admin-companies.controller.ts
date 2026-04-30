import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { AdminJwtGuard } from '../guards/admin-jwt.guard';
import { UpdateCompanyDto } from './admin-companies.dto';
import { AdminCompaniesService } from './admin-companies.service';

@Controller('admin/companies')
@UseGuards(AdminJwtGuard)
export class AdminCompaniesController {
  constructor(private readonly companies: AdminCompaniesService) {}

  /** Single company (id=1). */
  @Get()
  getSingleton() {
    return this.companies.getSingleton();
  }

  @Patch()
  update(@Body() dto: UpdateCompanyDto) {
    return this.companies.update(dto);
  }
}
