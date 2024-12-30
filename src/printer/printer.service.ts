import { Injectable } from '@nestjs/common';
import PdfPrinter from 'pdfmake';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import * as fse from 'fs-extra'; // Para leer archivos de certificado

const fonts = {
  Roboto: {
    normal: 'fonts/Roboto-Regular.ttf',
    bold: 'fonts/Roboto-Medium.ttf',
    italics: 'fonts/Roboto-Italic.ttf',
    bolditalics: 'fonts/Roboto-MediumItalic.ttf',
  },
};

@Injectable()
export class PrinterService {
  private printer = new PdfPrinter(fonts);

  // Método para crear el documento PDF
  createPdf(docDefinition: TDocumentDefinitions) {
    return this.printer.createPdfKitDocument(docDefinition);
  }

  // Método para guardar el PDF en una ubicación específica
  async savePdf(docDefinition: TDocumentDefinitions, outputPath: string) {
    const pdfDoc = this.createPdf(docDefinition);
    await pdfDoc.pipe(fse.createWriteStream(outputPath)); // Guardamos el PDF
    pdfDoc.end();
  }
}
