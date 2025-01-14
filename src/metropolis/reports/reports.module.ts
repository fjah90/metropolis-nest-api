import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { PrinterModule } from '../printer/printer.module';
import { PrinterService } from '../printer/printer.service';
import { PdfSigningService } from '../pdf-signing/pdf-signing.service';

@Module({
  controllers: [ReportsController],
  providers: [ReportsService, PrinterService, PdfSigningService],
  imports: [PrinterModule]
})
export class ReportsModule {}
