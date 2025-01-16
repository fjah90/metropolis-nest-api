import { Module } from '@nestjs/common';
import { PdfSigningService } from './pdf-signing.service';
import { PdfSigningController } from './pdf-signing.controller';

@Module({
  controllers: [PdfSigningController],
  providers: [PdfSigningService],
  exports: [PdfSigningService]
})
export class PdfSigningModule { }
