import { Controller, Post, UseInterceptors, UploadedFile, BadRequestException, InternalServerErrorException, Request, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiTags, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { BillDto } from './dto/bills.dto';
import { BillsService } from './bills.service';
import { PdfSigningService } from '../pdf-signing/pdf-signing.service';
import { AuthGuard } from 'src/auth/auth.guard';

@ApiBearerAuth()
@ApiTags('bills')
@Controller('bills')
@UseGuards(AuthGuard)
export class BillsController {
    constructor(private readonly billService: BillsService,
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
    async convertirXmlGetPDF(@UploadedFile() file: Express.Multer.File, @Request() req): Promise<{ pdfFileName: string; pdfUrl: string, xmlFileName: string, xmlUrl: string }> {
        if (!file) {
            throw new BadRequestException('No file uploaded');
        }

        try {
            const xmlData = file.buffer.toString();

            // 1. Convierte el XML a JSON y genera el PDF
            const json = await this.billService.convertirXmlAJson(xmlData);

            const pdfDetails = await this.billService.generatePdfFromJson(json, req.user.sub);  // Aquí se firma el PDF


            // Responde con los nombres y URLs de los archivos PDF y XML firmados
            return {
                pdfFileName: pdfDetails.pdfFileName,
                pdfUrl: pdfDetails.pdfUrl,
                xmlFileName: pdfDetails.xmlFileName,
                xmlUrl: pdfDetails.xmlUrl,
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
    async signXml(@UploadedFile() file: Express.Multer.File): Promise<{ xmlFileName: string, xmlUrl: string }> {
        if (!file) {
            throw new BadRequestException('No file uploaded');
        }

        try {
            const xmlData = file.buffer.toString();
            const xmlDetails = await this.pdfSigningService.signXml(xmlData); // Llamada al método de firma

            return xmlDetails;
        } catch (error) {
            console.error('Error processing file:', error);
            throw new InternalServerErrorException('Error processing file');
        }
    }

}