import { Controller, Get, Res } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { Response } from 'express';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('bill')
  async getBillReport(@Res() response: Response) {
    const pdfDoc = this.reportsService.getBillReports();

    response.setHeader('Content-Type', 'application/pdf');
    response.setHeader('Content-Disposition', 'inline; filename="Bill-Prueba.pdf"');

   // pdfDoc.pipe(response);
   // pdfDoc.end();
  }
}
