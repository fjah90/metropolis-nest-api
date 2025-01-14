import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fse from 'fs-extra';
import moment from 'moment';
import path from 'path';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { PdfDigitalSigner, SignerSettings, SignDigitalParameters } from 'sign-pdf-lib';
import { PrinterService } from 'src/metropolis/printer/printer.service';

@Injectable()
export class PdfSigningService {
  constructor(
    private readonly printerService: PrinterService,
    private readonly configService: ConfigService, // Para variables de entorno
  ) { }

  private async prepareSigner(): Promise<PdfDigitalSigner> {
    try {
      // Ajustamos las rutas de los certificados y claves privadas
      const certificatePath = path.resolve(process.cwd(), '.ssh/certificate.pem');
      const privateKeyPath = path.resolve(process.cwd(), '.ssh/private_decrypted.key');

      console.log('Ruta del certificado:', certificatePath);
      console.log('Ruta de la clave privada:', privateKeyPath);



      if (!(await fse.pathExists(certificatePath))) {
        throw new Error(`El archivo de certificado no existe: ${certificatePath}`);
      }
      if (!(await fse.pathExists(privateKeyPath))) {
        throw new Error(`El archivo de clave privada no existe: ${privateKeyPath}`);
      }

      const certificate = await fse.readFile(certificatePath);
      const privateKey = await fse.readFile(privateKeyPath);
      const password = this.configService.get<string>('PRIVATE_KEY_PASSWORD');

      const settings: SignerSettings = {
        signatureLength: 32768,
        rangePlaceHolder: 32768,
        signatureComputer: {
          certificate,
          password,
          key: privateKey,
        },
      };

      return new PdfDigitalSigner(settings);
    } catch (error) {
      console.error('Error preparando el firmante:', error);
      throw error;
    }
  }

  private async getSignatureParameters(
    x: number,
    y: number,
    alignment: 'center' | 'left' | 'right',
  ): Promise<SignDigitalParameters> {
    const pageWidth = 595.28;
    const pageHeight = 841.89;
    const signatureWidth = 200;
    const signatureHeight = 50;

    let adjustedX = x;
    if (alignment === 'center') {
      adjustedX = (pageWidth - signatureWidth) / 2;
    } else if (alignment === 'right') {
      adjustedX = pageWidth - signatureWidth - x;
    }

    const signatureImagePath = path.resolve(process.cwd(), 'public/assets/firma-prueba.png');
    if (!(await fse.pathExists(signatureImagePath))) {
      throw new Error(`El archivo de imagen de firma no existe: ${signatureImagePath}`);
    }

    const background = await fse.readFile(signatureImagePath);

    return {
      pageNumber: 1,
      signature: {
        name: 'Test Signer',
        location: 'Timisoara',
        reason: 'Signing',
        contactInfo: 'signer@semnezonline.ro',
      },
      visual: {
        rectangle: {
          left: adjustedX,
          top: y,
          right: adjustedX + signatureWidth,
          bottom: y - signatureHeight,
        },
        background,
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
  }

  async signPdf(docDefinition: TDocumentDefinitions): Promise<Buffer> {
    const outputPath = path.resolve(process.cwd(), 'public/output');
    if (!(await fse.pathExists(outputPath))) {
      await fse.mkdirp(outputPath);
    }

    const timestamp = moment().format('YYYY-MM-DD_HH-mm-ss');
    const uniqueFilename = `signed-pdf-${timestamp}.pdf`;
    const fullPath = path.resolve(outputPath, uniqueFilename);

    // Crear PDF
    const pdfDoc = this.printerService.createPdf(docDefinition);
    const writeStream = fse.createWriteStream(fullPath);

    await new Promise<void>((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', (error) => {
        console.error('Error al escribir el PDF:', error);
        reject(error);
      });
      pdfDoc.pipe(writeStream);
      pdfDoc.end();
    });

    console.log(`PDF generado en: ${fullPath}`);

    // Validar PDF
    if (!(await fse.pathExists(fullPath))) {
      throw new Error(`El archivo PDF no se generó correctamente: ${fullPath}`);
    }

    const pdf = await fse.readFile(fullPath);
    const pdfSigner = await this.prepareSigner();
    const parameters = await this.getSignatureParameters(50, 750, 'right');

    // Añadir formulario vacío y firmar
    const pdfWithForm = await this.addEmptyAcroForm(pdf);
    console.log('Formulario AcroForm añadido al PDF.');

    const signedPdf = await pdfSigner.signAsync(pdfWithForm, parameters);

    const signedPdfFilename = `signed-pdf-${timestamp}.pdf`;
    const signedPdfPath = path.resolve(outputPath, signedPdfFilename);
    await fse.writeFile(signedPdfPath, signedPdf);

    console.log(`PDF firmado guardado: ${signedPdfPath}`);

    const baseUrl = process.env.BASE_URL || 'http://localhost:3000/public';
    const relativeUrl = `/output/${signedPdfFilename}`;
    const fullUrl = new URL(relativeUrl, baseUrl).toString();

    const response = { url: fullUrl, message: "PDF Generado!" };

    return signedPdf;
  }


  private async addEmptyAcroForm(pdf: Buffer): Promise<Buffer> {
    const { PDFDocument } = require('pdf-lib');
    const existingPdfDoc = await PDFDocument.load(pdf);

    if (!existingPdfDoc.getForm()) {
      console.log('No se encontró un formulario AcroForm. Creando uno nuevo...');
      existingPdfDoc.createForm();
    } else {
      console.log('El formulario AcroForm ya existe en el PDF.');
    }

    return await existingPdfDoc.save();
  }
}
