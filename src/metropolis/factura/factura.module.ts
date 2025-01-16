import { Module } from '@nestjs/common';
import { FacturaService } from './factura.service';
import { FacturaController } from './factura.controller';

@Module({
  controllers: [FacturaController],
  providers: [FacturaService],
  exports: [FacturaService],
})
export class FacturaModule { }
