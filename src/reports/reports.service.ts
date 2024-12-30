import { Injectable } from '@nestjs/common';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { PrinterService } from 'src/printer/printer.service';

@Injectable()
export class ReportsService {
  constructor(private readonly printer: PrinterService) {}

  getBillReports(): PDFKit.PDFDocument {
    const docDefinition: TDocumentDefinitions = {
      content: ['Hola Mundo', 'Primer pdf'],
    };

    return this.printer.createPdf(docDefinition);
  }
}
