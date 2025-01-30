import { Controller, Post, UseInterceptors, UploadedFile, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiTags, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { BillDto } from './dto/bill.dto';
import { BillService } from './bill.service';
import { PdfSigningService } from '../pdf-signing/pdf-signing.service';

@ApiBearerAuth()
@ApiTags('bill')
@Controller('bill')
export class BillController {
    constructor(private readonly billService: BillService,
        private readonly pdfSigningService: PdfSigningService,
    ) { }

    @Post('conver-to-json')
    @UseInterceptors(FileInterceptor('file'))
    @ApiBody({ type: 'form-data' })
    @ApiResponse({ status: 200, type: BillDto })
    async convertirXml(@UploadedFile() file: Express.Multer.File): Promise<any> {
        if (!file) {
            throw new BadRequestException('No file uploaded');
        }

        try {
            const xmlData = file.buffer.toString();
            return this.billService.convertirXmlAJson(xmlData);
        } catch (error) {
            console.error('Error processing file:', error);
            throw new InternalServerErrorException('Error processing file');
        }
    }

    @Post('create-and-sign-pdf-and-xml')
    @UseInterceptors(FileInterceptor('file'))
    @ApiBody({ type: 'form-data' })
    @ApiResponse({ status: 200, description: 'PDF y XML generado y firmado correctamente.' })
    async convertirXmlGetPDF(@UploadedFile() file: Express.Multer.File): Promise<{ pdfFileName: string; pdfUrl: string, xmlFileName: string, xmlUrl: string }> {
        if (!file) {
            throw new BadRequestException('No file uploaded');
        }

        try {
            const xmlData = file.buffer.toString();
            
            // 1. Convierte el XML a JSON y genera el PDF
            const json = await this.billService.convertirXmlAJson(xmlData);
            const pdfDetails = await this.billService.generatePdfFromJson(json);  // Aquí se firma el PDF

            // 2. Firma el XML
            const xmlDetails = await this.pdfSigningService.signXml(xmlData, '123456');  // Firma del XML

            // Responde con los nombres y URLs de los archivos PDF y XML firmados
            return {
                pdfFileName: pdfDetails.fileName,
                pdfUrl: pdfDetails.url,
                xmlFileName: xmlDetails.fileName,
                xmlUrl: xmlDetails.url,
            };
        } catch (error) {
            console.error('Error processing file:', error);
            throw new InternalServerErrorException('Error processing file');
        }
    }

    @Post('create-and-sign-xml')
    @UseInterceptors(FileInterceptor('file'))
    @ApiBody({ type: 'form-data' })
    @ApiResponse({ status: 200, description: 'PDF y XML generado y firmado correctamente.' })
    async firmarXml(@UploadedFile() file: Express.Multer.File): Promise<{ fileName: string; url: string }> {
        if (!file) {
            throw new BadRequestException('No file uploaded');
        }

        try {
            const xmlData = file.buffer.toString();
            const pdfDetails = await this.pdfSigningService.signXml(xmlData); // Llamada al método de firma
            return pdfDetails;
        } catch (error) {
            console.error('Error processing file:', error);
            throw new InternalServerErrorException('Error processing file');
        }
    }

}