import { Controller, Post, Body, Res } from '@nestjs/common';
import { Response } from 'express';
import { PdfSigningService } from './pdf-signing.service';
import { TDocumentDefinitions } from 'pdfmake/interfaces';

@Controller('pdf-signing')
export class PdfSigningController {
  constructor(private readonly pdfSigningService: PdfSigningService) {}

  @Post('create-and-sign-pdf')
  async createAndSignPdf(@Body() body: { content: string }, @Res() response: Response) {
    // Definir el contenido del PDF
    const docDefinition: TDocumentDefinitions = {
      content: [body.content], // El contenido dinámico de la solicitud
    };

    // Firmamos el PDF
    const signedPdfBuffer = await this.pdfSigningService.signPdf(docDefinition);

    // Retornamos el PDF firmado como base64
    response.setHeader('Content-Type', 'application/pdf');
    response.setHeader('Content-Disposition', 'inline; filename="Signed-Pdf.pdf"');
    response.end(signedPdfBuffer);
  }
}
