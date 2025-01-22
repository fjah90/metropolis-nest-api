import { Controller, Post, UseInterceptors, UploadedFile, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiTags, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { BillDto } from './dto/bill.dto';
import { BillService } from './bill.service';

@ApiBearerAuth()
@ApiTags('bill')
@Controller('bill')
export class BillController {
    constructor(private readonly billService: BillService) { }

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

    @Post('create-and-sign-pdf')
    @UseInterceptors(FileInterceptor('file'))
    @ApiBody({ type: 'form-data' })
    @ApiResponse({ status: 200, description: 'PDF generado y firmado correctamente.' })
    async convertirXmlGetPDF(@UploadedFile() file: Express.Multer.File): Promise<{ fileName: string; url: string }> {
        if (!file) {
            throw new BadRequestException('No file uploaded');
        }

        try {
            const xmlData = file.buffer.toString();
            return this.billService.convertirXmlAJsonAngGetPDF(xmlData);
        } catch (error) {
            console.error('Error processing file:', error);
            throw new InternalServerErrorException('Error processing file');
        }
    }

}