import { Controller, Get, Post, Body, Patch, Param, Delete, Res } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { Response } from 'express';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('bill')
  async getBillReports(@Res() response: Response) {
    const signedPdf = await this.reportsService.getBillReport();

     // Establece la respuesta como un archivo PDF
     response.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="factura-firmada.pdf"',
    });

    response.send(signedPdf); // Envía el PDF firmado al cliente
  }
}
