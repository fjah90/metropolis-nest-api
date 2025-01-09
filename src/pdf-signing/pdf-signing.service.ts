import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import * as fse from 'fs-extra';
import path from 'path';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { PdfDigitalSigner, SignerSettings, SignDigitalParameters } from 'sign-pdf-lib';
import { PrinterService } from 'src/printer/printer.service';

@Injectable()
export class PdfSigningService {
  constructor(private readonly printerService: PrinterService,
                               config:ConfigService
  ) {}

  // Método para preparar el firmante digital
  private async prepareSigner(): Promise<PdfDigitalSigner> {
    try {
      // Leemos los archivos de la clave privada y el certificado
      const certificate = await fse.readFile(
        path.resolve(process.cwd(), 'certificates/certificate.pem')
      );

      const privateKey = await fse.readFile(
        path.resolve(process.cwd(), 'certificates/private_decrypted.key')
      );

      // Si la clave está cifrada, debes proporcionar la contraseña
      const password = process.env.PRIVATE_KEY_PASSWORD; // O cargarla desde una variable de entorno o configuración

      const settings: SignerSettings = {
        signatureLength: 32768,
        rangePlaceHolder: 32768,
        signatureComputer: {
          certificate: certificate, // Certificado
          password: password, // Contraseña para la clave privada (si está cifrada)
          key: privateKey, // Clave privada
        },
      };

      // Creamos el firmante digital
      return new PdfDigitalSigner(settings);
    } catch (error) {
      console.error('Error en preparar firmante:', error);
      throw error;
    }
  }

  // Método para obtener los parámetros de firma digital
  private async getSignatureParameters(
    x: number, // Coordenada x (horizontal) en puntos
    y: number, // Coordenada y (vertical) en puntos
    alignment: 'center' | 'left' | 'right', // Alineación horizontal
  ): Promise<SignDigitalParameters> {
    const pageWidth = 595.28; // Ancho estándar de una página A4 en puntos
    const pageHeight = 841.89; // Altura estándar de una página A4 en puntos
    const signatureWidth = 200; // Ancho de la firma
    const signatureHeight = 50; // Altura de la firma
  
    // Ajustar x según la alineación
    let adjustedX = x;
    if (alignment === 'center') {
      adjustedX = (pageWidth - signatureWidth) / 2;
    } else if (alignment === 'right') {
      adjustedX = pageWidth - signatureWidth - x; // Distancia desde el borde derecho
    }
  
    const parameters: SignDigitalParameters = {
      pageNumber: 1,
      signature: {
        name: 'Test Signer',
        location: 'Timisoara',
        reason: 'Signing',
        contactInfo: 'signer@semnezonline.ro',
      },
      visual: {
        rectangle: {
          left: adjustedX, // Coordenada x ajustada
          top: y, // Coordenada y desde la parte superior
          right: adjustedX + signatureWidth, // Final del rectángulo
          bottom: y - signatureHeight, // Altura hacia abajo
        },
        background: await fse.readFile(path.resolve(process.cwd(), 'assets/firma-prueba.png')),
        texts: [
          { lines: ['JOHN', 'DOE'] },
          {
            lines: [
              'Digitally signed by',
              'JOHN DOE',
              'Date: 2023.11.03',
              '20:28:46 +02\'00\'',
            ],
          },
        ],
      },
    };
  
    return parameters;
  }
  
  // Método para firmar el PDF y devolver el archivo firmado
  async signPdf(docDefinition: TDocumentDefinitions): Promise<Buffer> {
    // Primero generamos el PDF con PdfMake
    const pdfDoc = this.printerService.createPdf(docDefinition);
    const outputPath = 'output/generatedPdf.pdf';
    await pdfDoc.pipe(fse.createWriteStream(outputPath));
    pdfDoc.end();
  
    console.log('PDF generado. Revisando detalles del archivo...');
    // Aseguramos que el PDF tenga un formulario AcroForm vacío
    const pdf = await fse.readFile(outputPath);
    console.log(`Tamaño del PDF generado: ${pdf.length} bytes`);

    const pdfSigner = await this.prepareSigner();
    const parameters = await this.getSignatureParameters(50, 700, 'right'); // Derecha: (50, 700, 'right'), Izquierda: (50, 700, 'left'), Centro: (0, 700, 'center');
  
    // Si el PDF no tiene un AcroForm, lo agregamos de manera básica
    const pdfWithForm = await this.addEmptyAcroForm(pdf);

    console.log('Formulario AcroForm añadido al PDF.');
    console.log(`Tamaño del PDF modificado: ${pdfWithForm.length} bytes`);
  
    // Firmamos el PDF usando sign-pdf-lib
    const signedPdf = await pdfSigner.signAsync(pdfWithForm, parameters);

    console.log('PDF firmado con éxito. Tamaño final del archivo:');
    console.log(`Tamaño del PDF firmado: ${signedPdf.length} bytes`);
  
    return signedPdf; // Retornamos el PDF firmado
    
  }
  
  // Método para agregar un formulario vacío AcroForm al PDF
  private async addEmptyAcroForm(pdf: Buffer): Promise<Buffer> {
    const { PDFDocument } = require('pdf-lib');
    const existingPdfDoc = await PDFDocument.load(pdf);
  
    // Verificamos si ya existe un formulario AcroForm
    if (!existingPdfDoc.getForm()) {
      console.log('No se encontró un formulario AcroForm. Creando uno nuevo...');
      existingPdfDoc.createForm();
    } else {
      console.log('El formulario AcroForm ya existe en el PDF.');
    }
  
    // Guardamos y devolvemos el PDF modificado
    return await existingPdfDoc.save();
  }
  
}  
