import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fse from 'fs-extra';
import moment from 'moment';
import path from 'path';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { PdfDigitalSigner, SignerSettings, SignDigitalParameters } from 'sign-pdf-lib';
import { PrinterService } from '../printer/printer.service';

@Injectable()
export class PdfSigningService {
  private invoiceCounter: number;

  constructor(
    private readonly printerService: PrinterService,
    private readonly configService: ConfigService, // Para variables de entorno
  ) {
    this.invoiceCounter = 0;
    this.loadInvoiceCounter();
  }

  private async loadInvoiceCounter() {
    const counterFilePath = path.resolve(process.cwd(), 'public', 'invoice-counter.json');
    if (await fse.pathExists(counterFilePath)) {
      const data = await fse.readJson(counterFilePath);
      this.invoiceCounter = data.counter;
    } else {
      this.invoiceCounter = 0;
    }
  }

  private async incrementInvoiceCounter() {
    this.invoiceCounter += 1;
    const counterFilePath = path.resolve(process.cwd(), 'public', 'invoice-counter.json');
    await fse.writeJson(counterFilePath, { counter: this.invoiceCounter });
  }

  private async prepareSigner(): Promise<PdfDigitalSigner> {
    try {
      const certificatePath = path.resolve(process.cwd(), '.ssh/certificate.pem');
      const privateKeyPath = path.resolve(process.cwd(), '.ssh/private_decrypted.key');

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
              `Date: ${moment().format('YYYY-MM-DD')}`,
              '20:28:46 +02\'00\'',
            ],
          },
        ],
      },
    };
  }

  async signPdf(docDefinition: TDocumentDefinitions): Promise<{ fileName: string, url: string }> {
    await this.incrementInvoiceCounter();
    const invoiceNumber = this.invoiceCounter.toString().padStart(4, '0');

    const timestamp = moment().format('YYYY-MM-DD');
    const uniqueFilename = `factura-N-${invoiceNumber}_${timestamp}.pdf`;

    const outputPath = path.resolve(process.cwd(), 'public/output');
    if (!(await fse.pathExists(outputPath))) {
      await fse.mkdirp(outputPath);
    }

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

    // Validar PDF
    if (!(await fse.pathExists(fullPath))) {
      throw new Error(`El archivo PDF no se generó correctamente: ${fullPath}`);
    }

    const pdf = await fse.readFile(fullPath);
    const pdfSigner = await this.prepareSigner();
    const parameters = await this.getSignatureParameters(50, 750, 'right');

    // Añadir formulario vacío y firmar
    const pdfWithForm = await this.addEmptyAcroForm(pdf);
    const signedPdf = await pdfSigner.signAsync(pdfWithForm, parameters);

    const signedPdfFilename = `${uniqueFilename}`;
    const signedPdfPath = path.resolve(outputPath, signedPdfFilename);
    await fse.writeFile(signedPdfPath, signedPdf);

    const baseUrl = process.env.BASE_URL || 'http://localhost:3000/public';
    const relativeUrl = `/public/output/${signedPdfFilename}`;
    const fullUrl = new URL(relativeUrl, baseUrl).toString();

    return { fileName: signedPdfFilename, url: fullUrl };
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
