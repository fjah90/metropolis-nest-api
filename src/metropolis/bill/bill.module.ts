import { Module } from '@nestjs/common';
import { BillService } from './bill.service';
import { BillController } from './bill.controller';
import { PdfSigningModule } from '../pdf-signing/pdf-signing.module';

@Module({
  imports: [PdfSigningModule],
  controllers: [BillController],
  providers: [BillService],
  exports: [BillService],
})
export class BillModule { }