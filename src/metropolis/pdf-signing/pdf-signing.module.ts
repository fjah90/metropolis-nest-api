import { Module } from '@nestjs/common';
import { PdfSigningService } from './pdf-signing.service';
import { PdfSigningController } from './pdf-signing.controller';
import { PrinterService } from '../printer/printer.service';
import { BillStorageModule } from '../bill-storage/bill-storage.module';

@Module({
  controllers: [PdfSigningController],
  providers: [PdfSigningService, PrinterService],
  exports: [PdfSigningService],
  imports: [BillStorageModule]
})
export class PdfSigningModule { }