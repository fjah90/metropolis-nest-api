import { Controller, Get, Post, Body, Patch, Param, Delete, Res } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { PrinterService } from 'src/printer/printer.service';
import { Response } from 'express';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService, printer: PrinterService) {}

  @Get('bill')
  async getBillReport(@Res () response: Response){
    const pdfDoc= await this.reportsService.getBillReports();

    response.setHeader('Content-type', 'application/pdf')
    pdfDoc.info.Title = 'Facturita';
    pdfDoc.pipe(response);
    pdfDoc.end()
  }

}