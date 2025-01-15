import { Controller, Post, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiTags, ApiResponse } from '@nestjs/swagger';
import { FacturaDto } from './dto/factura.dto';
import { FacturaService } from './factura.service';
@ApiTags('facturas')
@Controller('facturas')
export class FacturaController {
    constructor(private readonly facturaService: FacturaService) { }
    @Post()
    @UseInterceptors(FileInterceptor('file'))
    @ApiBody({ type: 'form-data' })
    @ApiResponse({ status: 200, type: FacturaDto })
    async convertirXml(@UploadedFile() file: Express.Multer.File): Promise<FacturaDto> {
        const xmlData = file.buffer.toString('utf-8');
        return this.facturaService.convertirXmlAJson(xmlData);
    }
}