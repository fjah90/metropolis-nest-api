import { Controller, Get, Res } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { Response } from 'express';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('bill')
  async getBillReports(@Res() response: Response) {
    const report = await this.reportsService.getBillReport();

    // Responde con el JSON que contiene el nombre del archivo y la URL
    response.json(report);
  }
}
