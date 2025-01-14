import { Injectable } from '@nestjs/common';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { PrinterService } from '../printer/printer.service';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { billReport } from './structure/bill.report';
import { PdfSigningService } from '../pdf-signing/pdf-signing.service';
import * as fse from 'fs-extra';
import * as path from 'path';
import * as moment from 'moment';


@Injectable()
export class ReportsService {
  constructor(private readonly printer: PrinterService,
              private readonly pdfSigningService: PdfSigningService
  ) {}

  async getBillReport(): Promise <Buffer> {
    const docDefinition: TDocumentDefinitions = billReport();

     // Genera el PDF
     const pdfDoc = await this.printer.createPdf(docDefinition);

     // Firma el PDF
     const signedPdf = await this.pdfSigningService.signPdf(docDefinition);
 
     return signedPdf; // Retorna el PDF firmado



  }

}
