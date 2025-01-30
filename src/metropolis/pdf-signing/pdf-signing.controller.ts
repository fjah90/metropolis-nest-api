import { Controller, Post, Body, Res, InternalServerErrorException, BadRequestException, UseInterceptors, UploadedFile } from '@nestjs/common';
import { Response } from 'express';
import { PdfSigningService } from './pdf-signing.service';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiBearerAuth()
@ApiTags('pdf-signing')
@Controller('pdf-signing')
export class PdfSigningController {
  constructor(private readonly pdfSigningService: PdfSigningService) { }

  @Post('create-and-sign-pdf')
  async createAndSignPdf(@Body() body: { content: string }, @Res() response: Response) {
    // Definir el contenido del PDF
    const docDefinition: TDocumentDefinitions = {
      content: [body.content,],
      // El contenido dinámico de la solicitud
    };

    // Firmamos el PDF
    const signedPdfBuffer = await this.pdfSigningService.signPdf(docDefinition);

    // Retornamos el PDF firmado como base64
    response.setHeader('Content-Type', 'application/pdf');
    response.setHeader('Content-Disposition', 'inline; filename="Signed-Pdf.pdf"');
    response.end(signedPdfBuffer);

    // console.log(signedPdfBuffer)

    // return signedPdfBuffer;
  }

  @Post('create-and-sign-xml')
  @UseInterceptors(FileInterceptor('file'))
  @ApiBody({ type: 'form-data' })
  @ApiResponse({ status: 200, description: 'XML generado y firmado correctamente.' })
  async createAndSignXml(@UploadedFile() file: Express.Multer.File): Promise<{ fileName: string; url: string }> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    try {
      // Leemos el contenido del archivo XML
      const xmlData = file.buffer.toString();

      // Firmamos el XML
      const signedXml = await this.pdfSigningService.signXml(xmlData);

      return {
        fileName: signedXml.fileName,
        url: signedXml.url,
      };
    } catch (error) {
      console.error('Error processing file:', error);
      throw new InternalServerErrorException('Error processing file');
    }
  }
}