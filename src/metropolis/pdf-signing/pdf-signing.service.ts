import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fse from 'fs-extra';
import moment from 'moment';
import path from 'path';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { PdfDigitalSigner, SignerSettings, SignDigitalParameters } from 'sign-pdf-lib';
import { PrinterService } from '../printer/printer.service';
import { PDFDocument } from 'pdf-lib';
import { BillStorageService } from '../bill-storage/bill-storage.service';
import { SignedXml } from 'xml-crypto';
@Injectable()
export class PdfSigningService {
  private readonly privateKey: Buffer;

  constructor(
    private readonly printerService: PrinterService,
    private readonly configService: ConfigService, // Para variables de entorno
    private readonly billStorageService: BillStorageService, // Para crear el archivo en base de datos
  ) {
    const privateKeyPath = path.resolve(process.cwd(), '.ssh/private_decrypted.key');
    if (!fse.existsSync(privateKeyPath)) {
      throw new Error(`El archivo de clave privada no existe: ${privateKeyPath}`);
    }
    this.privateKey = fse.readFileSync(privateKeyPath);
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
    pageNumber: number = 1
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
      pageNumber,
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

  async signPdf(docDefinition: TDocumentDefinitions, pdfName: string): Promise<{ id: number, pdfFileName: string, pdfUrl: string, xmlFileName: string, xmlUrl: string }> {
    const uniqueFilename = pdfName + '.pdf';
    const xmlFilename = pdfName + '.xml';

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
    const pdfRead = await PDFDocument.load(pdf);
    const totalPages = pdfRead.getPageCount();

    console.log(`El PDF tiene ${totalPages} páginas.`);
    const parameters = await this.getSignatureParameters(50, 780, 'right', totalPages);

    // Añadir formulario vacío y firmar
    const pdfWithForm = await this.addEmptyAcroForm(pdf);
    const signedPdf = await pdfSigner.signAsync(pdfWithForm, parameters);

    const signedPdfFilename = `${uniqueFilename}`;
    const signedPdfPath = path.resolve(outputPath, signedPdfFilename);
    await fse.writeFile(signedPdfPath, signedPdf);

    // TODO: en este punto se debe subir el archivo a un servidor de almacenamiento en la nube
    const relativeUrl = `/public/output/${signedPdfFilename}`;
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000/public';
    // TODO: se debe construir la url del archivo en el servidor de almacenamiento en la nube
    // TODO: confirmar que el archivo este subido a la nube
    const fullUrl = new URL(relativeUrl, baseUrl).toString(); //baseUrl por url del archivo en el servidor
    const xmlUrl = new URL(`/public/output/${xmlFilename}`, baseUrl).toString();

    try {
      const data = await this.registerPdfAndXMLInDatabase(signedPdfFilename, fullUrl, xmlFilename, xmlUrl);
      if (!data) {
        throw new Error('Error al registrar el PDF en la base de datos');
      }
      return { id: data.id, pdfFileName: signedPdfFilename, pdfUrl: fullUrl, xmlFileName: xmlFilename, xmlUrl: xmlUrl };
    } catch (error) {
      console.error('Error registrando el PDF en la base de datos:', error);
      throw error;
    }
    // TODO: borrar el archivo del output
    // await fse.unlink(fullPath);
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

  //Metodo para Guardado en base de datos
  private async registerPdfAndXMLInDatabase(PDFfileName: string, PDFfullUrl: string, XMLfileName: string, XMLfullUrl: string,): Promise<any> {
    try {
      // Crear el registro en la base de datos
      const data = await this.billStorageService.createBill({
        pdf_name: PDFfileName,
        xml_name: XMLfileName,
        pdf_url: PDFfullUrl,
        xml_url: XMLfullUrl,
        is_deleted: false,
      });
      if (!data) {
        throw new Error('Error al registrar el PDF en la base de datos');
      }
      console.log(data);
      console.log(`PDF registrado en la base de datos: ${data.id}`);
      return data;
    } catch (error) {
      console.error('Error registrando el PDF en la base de datos:', error);
      throw error;
    }
  }

  //metodo para firmar el xml
  async signXml(xml: string, xmlName: string = 'SignedXml.xml'): Promise<{ xmlFileName: string; xmlUrl: string }> {
    const sig = new SignedXml({ privateKey: this.privateKey });
    sig.addReference({
      xpath: "//*[local-name(.)='Invoices']", // Ajusta según XML
      digestAlgorithm: 'http://www.w3.org/2000/09/xmldsig#sha1',
      transforms: ['http://www.w3.org/2001/10/xml-exc-c14n#'],
    });

    sig.canonicalizationAlgorithm = 'http://www.w3.org/2001/10/xml-exc-c14n#';
    sig.signatureAlgorithm = 'http://www.w3.org/2000/09/xmldsig#rsa-sha1';

    sig.computeSignature(xml);
    const signedXml = sig.getSignedXml();

    // Crear nombre y ruta del archivo
    const fileName = xmlName;
    const outputPath = path.resolve(process.cwd(), 'public/output');

    if (!(await fse.pathExists(outputPath))) {
      await fse.mkdirp(outputPath);
    }

    const filePath = path.resolve(outputPath, fileName);
    await fse.writeFile(filePath, signedXml);

    // Construir URL del archivo
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000/public';
    const fileUrl = new URL(`/output/${fileName}`, baseUrl).toString();

    return { xmlFileName: xmlName, xmlUrl: fileUrl };
  }



}
