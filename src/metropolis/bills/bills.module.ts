import { Module } from '@nestjs/common';
import { BillsService } from './bills.service';
import { BillsController } from './bills.controller';
import { PdfSigningModule } from '../pdf-signing/pdf-signing.module';

@Module({
  imports: [PdfSigningModule],
  controllers: [BillsController],
  providers: [BillsService],
  exports: [BillsService],
})
export class BillsModule { }