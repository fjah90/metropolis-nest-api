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
        signatureLength: 2048,
        rangePlaceHolder: 4096,
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
  private async getSignatureParameters(): Promise<SignDigitalParameters> {
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
          left: 50,
          top: 400,
          right: 300,
          bottom: 300,
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
  
    // Aseguramos que el PDF tenga un formulario AcroForm vacío
    const pdf = await fse.readFile(outputPath);
    const pdfSigner = await this.prepareSigner();
    const parameters = await this.getSignatureParameters();
  
    // Si el PDF no tiene un AcroForm, lo agregamos de manera básica
    const pdfWithForm = await this.addEmptyAcroForm(pdf);
  
    // Firmamos el PDF usando sign-pdf-lib
    const signedPdf = await pdfSigner.signAsync(pdfWithForm, parameters);
  
    return signedPdf; // Retornamos el PDF firmado
  }
  
  // Método para agregar un formulario vacío AcroForm al PDF
  private async addEmptyAcroForm(pdf: Buffer): Promise<Buffer> {
    // Aquí puedes usar una librería como `pdf-lib` o cualquier otra que permita modificar el PDF
    const { PDFDocument } = require('pdf-lib');
    const existingPdfDoc = await PDFDocument.load(pdf);
  
    // Crear un formulario AcroForm vacío
    const acroForm = existingPdfDoc.getForm();
    
    // Si el formulario no existe, lo creamos (esto asegura que el PDF tenga un AcroForm)
    if (!acroForm) {
      existingPdfDoc.createForm();
    }
  
    // Devolvemos el PDF con el formulario agregado
    return await existingPdfDoc.save();
  }
}  
