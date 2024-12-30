import { Injectable } from '@nestjs/common';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { PrinterService } from 'src/printer/printer.service';

@Injectable()
export class ReportsService {
  constructor(private readonly printer: PrinterService) {}

  // Modificado para retornar el PDF como un buffer
  getBillReports(): Promise<Buffer> {
    const docDefinition: TDocumentDefinitions = {
      content: ['Hola Mundo', 'Primer pdf'],
    };

    return new Promise((resolve, reject) => {
      const pdfDoc = this.printer.createPdf(docDefinition);
      const chunks: any[] = [];

      pdfDoc.on('data', (chunk) => {
        chunks.push(chunk);
      });

      pdfDoc.on('end', () => {
        resolve(Buffer.concat(chunks));
      });

      pdfDoc.on('error', (err) => {
        reject(err);
      });

      pdfDoc.end();
    });
  }
}
