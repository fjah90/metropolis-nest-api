import { Injectable } from '@nestjs/common';
import { parseString } from 'xml2js';
import { FacturaDto } from './dto/factura.dto';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { TDocumentDefinitions, Content } from 'pdfmake/interfaces';
import { PdfSigningService } from '../pdf-signing/pdf-signing.service';

@Injectable()
export class FacturaService {
    constructor(private readonly pdfSigningService: PdfSigningService) { }
    async convertirXmlAJson(xml: any): Promise<FacturaDto> {
        return new Promise((resolve, reject) => {
            parseString(
                xml,
                { explicitArray: false, tagNameProcessors: [removeNamespace] },
                (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        try {
                            const facturae = result.Facturae;
                            const invoice = facturae.Invoices.Invoice;
                            const parties = facturae.Parties;

                            const tax = invoice.TaxesOutputs.Tax;
                            const paymentDetails = invoice.PaymentDetails.Installment;
                            const items = invoice.Items.InvoiceLine;

                            const facturaData = {
                                encabezadoArchivo: {
                                    schemaVersion: facturae.FileHeader.SchemaVersion,
                                    modalidad: facturae.FileHeader.Modality,
                                    tipoEmisorFactura: facturae.FileHeader.InvoiceIssuerType,
                                    lote: {
                                        identificadorLote: facturae.FileHeader.Batch.BatchIdentifier,
                                        cantidadFacturas: facturae.FileHeader.Batch.InvoicesCount,
                                        totalFacturasImporte: facturae.FileHeader.Batch.TotalInvoicesAmount.TotalAmount,
                                        totalPendiente: facturae.FileHeader.Batch.TotalOutstandingAmount.TotalAmount,
                                        totalEjecutable: facturae.FileHeader.Batch.TotalExecutableAmount.TotalAmount,
                                        codigoMoneda: facturae.FileHeader.Batch.InvoiceCurrencyCode,
                                    },
                                },
                                vendedor: {
                                    nombreEmpresaVendedora: parties.SellerParty.LegalEntity.CorporateName,
                                    direccionEmpresaVendedora: parties.SellerParty.LegalEntity.AddressInSpain,
                                    detallesContactoVendedora: parties.SellerParty.LegalEntity.ContactDetails,
                                    identificacionFiscal: parties.SellerParty.TaxIdentification,
                                },
                                comprador: {
                                    nombreEmpresaCompradora: parties.BuyerParty.LegalEntity.CorporateName,
                                    direccionEmpresaCompradora: parties.BuyerParty.LegalEntity.AddressInSpain,
                                    detallesContactoCompradora: parties.BuyerParty.LegalEntity.ContactDetails,
                                    identificacionFiscal: parties.BuyerParty.TaxIdentification,
                                    centrosAdministrativos: parties.BuyerParty.AdministrativeCentres.AdministrativeCentre,
                                },
                                factura: {
                                    numeroFactura: invoice.InvoiceHeader.InvoiceNumber,
                                    codigoSerieFactura: invoice.InvoiceHeader.InvoiceSeriesCode,
                                    tipoDocumentoFactura: invoice.InvoiceHeader.InvoiceDocumentType,
                                    claseFactura: invoice.InvoiceHeader.InvoiceClass,
                                    datosEmision: {
                                        fechaEmision: invoice.InvoiceIssueData.IssueDate,
                                        fechaOperacion: invoice.InvoiceIssueData.OperationDate,
                                        periodoFacturacion: {
                                            inicio: invoice.InvoiceIssueData.InvoicingPeriod.StartDate,
                                            fin: invoice.InvoiceIssueData.InvoicingPeriod.EndDate,
                                        },
                                        codigoMonedaFactura: invoice.InvoiceIssueData.InvoiceCurrencyCode,
                                        codigoMonedaImpuestos: invoice.InvoiceIssueData.TaxCurrencyCode,
                                        idioma: invoice.InvoiceIssueData.LanguageName,
                                    },
                                },
                                impuestos: {
                                    tipoImpuesto: tax.TaxTypeCode,
                                    tasaImpuesto: parseFloat(tax.TaxRate),
                                    baseImponible: tax.TaxableBase.TotalAmount,
                                    importeImpuesto: tax.TaxAmount.TotalAmount,
                                    recargoEquivalencia: tax.EquivalenceSurchargeAmount.TotalAmount,
                                },
                                totales: {
                                    importeBruto: invoice.InvoiceTotals.TotalGrossAmount,
                                    importeBrutoAntesImpuestos: invoice.InvoiceTotals.TotalGrossAmountBeforeTaxes,
                                    totalImpuestos: invoice.InvoiceTotals.TotalTaxOutputs,
                                    impuestosRetenidos: invoice.InvoiceTotals.TotalTaxesWithheld,
                                    importeTotal: invoice.InvoiceTotals.InvoiceTotal,
                                    totalPendiente: invoice.InvoiceTotals.TotalOutstandingAmount,
                                    totalEjecutable: invoice.InvoiceTotals.TotalExecutableAmount,
                                },
                                detallesPago: {
                                    fechaVencimiento: paymentDetails.InstallmentDueDate,
                                    importeVencimiento: paymentDetails.InstallmentAmount,
                                    metodoPago: paymentDetails.PaymentMeans,
                                    cuentaDestino: paymentDetails.AccountToBeCredited?.IBAN,
                                },
                                datosAdicionales: invoice.AdditionalData.InvoiceAdditionalInformation,
                                items: {
                                    referenciaTransaccion: items.IssuerTransactionReference,
                                    descripcionItem: items.ItemDescription,
                                    cantidad: items.Quantity,
                                    unidadMedida: items.UnitOfMeasure,
                                    precioUnitarioSinImpuesto: items.UnitPriceWithoutTax,
                                    costeTotal: items.TotalCost,
                                    importeBruto: items.GrossAmount,
                                    // impuestos: items.TaxesOutputs.Tax.map((tax: any) => ({
                                    //     tipoImpuesto: tax.TaxTypeCode,
                                    //     tasaImpuesto: parseFloat(tax.TaxRate),
                                    //     baseImponible: tax.TaxableBase.TotalAmount,
                                    //     importeImpuesto: tax.TaxAmount.TotalAmount,
                                    //     recargoEquivalencia: tax.EquivalenceSurchargeAmount.TotalAmount,
                                    // },
                                },
                            };

                            const facturaDto = plainToClass(FacturaDto, facturaData);
                            validate(facturaDto).then((errors) => {
                                if (errors.length > 0) {
                                    reject(errors);
                                } else {
                                    resolve(facturaDto);
                                }
                            });
                        } catch (parseError) {
                            reject(`Error al procesar el XML: ${parseError.message}`);
                        }
                    }
                }
            );
        });
    }

    async convertirXmlAJsonAngGetPDF(xml: any): Promise<{ fileName: string; url: string }> {
        // Convertir XML a JSON
        const json = await this.convertirXmlAJson(xml);
    
        // Generar y firmar PDF
        const pdfDetails = await this.generatePdfFromJson(json);
    
        return pdfDetails;
    }
    async generatePdfFromJson(jsonData: any): Promise<{ fileName: string; url: string }> {
        // Construir la estructura del PDF dinámicamente usando jsonData
        const docDefinition: any = this.billReport(jsonData);
      
        // Firmar el PDF
        const { fileName, url } = await this.pdfSigningService.signPdf(docDefinition);
      
        return { fileName, url };
      }

       async billReport(jsonData?: FacturaDto): Promise<TDocumentDefinitions> {
      
            const logo: Content = {
              image: 'public/assets/logo-metropolis-oficial.png',
              width: 120,
              alignment: 'left',
            };
        return {
          // Encabezado principal
          header: {
            text: 'Factura Electrónica',
            alignment: 'center',
            margin: [0, 10, 0, 20],
            fontSize: 18,
            bold: true,
          },
      
          // Contenido principal
          content: [
            // Sección del logo y datos de la empresa/factura
            {
              columns: [
                // Columna izquierda: Logo y datos del vendedor
                {
                  stack: [
                    logo,
                    {
                      text: jsonData.Parties.SellerParty.LegalEntity.CorporateName || 'Metrópolis Comunicación S.L.U.',
                      style: 'vendedorHeader',
                      margin: [0, 10, 0, 0],
                    },
                    {
                      text: 'Plaza Doctor Olivera, 15 1ºB\n38202, La Laguna, S/C de Tenerife, ESP\nTeléfono: 922265552\nEmail: sandra@metropoliscom.com\nNIF: B38402756',
                    },
                  ],
                  width: '*',
                },
                // Columna derecha: Datos de la factura
                {
                  stack: [
                    {
                      text: 'Factura',
                      style: 'facturaHeader',
                    },
                    {
                      text: 'Número de Factura: 10200\nTipo Documento: FC\nClase Factura: OO\nFecha de Emisión: 2018-05-31\nPeriodo de Facturación: 01/05/2018 - 31/05/2018',
                    },
                  ],
                  alignment: 'right',
                  width: '*',
                },
              ],
              margin: [0, 0, 0, 20],
            },
      
            // Información del comprador
            {
              text: 'Datos del Comprador',
              style: 'sectionHeader',
            },
            {
              text: [
                'Nombre: Fundación Mapfre Guanarteme\n',
                'Dirección: Calle Castillo, 6\n',
                '35001, Santa Cruz de Tenerife, Las Palmas de GC, ESP\n',
                'NIF: G35134097',
              ],
              margin: [0, 0, 0, 20],
            },
      
            // Detalles de los productos adquiridos
            {
              text: 'Productos Adquiridos',
              style: 'sectionHeader',
            },
            {
              table: {
                widths: ['*', '*', '*', '*'],
                body: [
                  [
                    { text: 'Descripción', bold: true },
                    { text: 'Cantidad', bold: true },
                    { text: 'Precio Unitario', bold: true },
                    { text: 'Coste Total', bold: true },
                  ],
                  [
                    'Servicio de Seguimiento de Medios para la Fundación Mapfre Guanarteme.',
                    '1.0',
                    '550.00 EUR',
                    '550.00 EUR',
                  ],
                ],
              },
              margin: [0, 0, 0, 20],
            },
      
            // Totales e impuestos
            {
              text: 'Totales',
              style: 'sectionHeader',
            },
            {
              table: {
                widths: ['*', '*'],
                body: [
                  [{ text: 'Importe Bruto:', bold: true }, '550.00 EUR'],
                  [{ text: 'Total Impuestos (7%):', bold: true }, '38.50 EUR'],
                  [{ text: 'Importe Total:', bold: true }, '588.50 EUR'],
                  [{ text: 'Total Pendiente:', bold: true }, '588.50 EUR'],
                ],
              },
              margin: [0, 0, 0, 20],
            },
      
            // Detalles del pago
            {
              text: 'Detalles del Pago',
              style: 'sectionHeader',
            },
            {
              text: [
                'Fecha de Vencimiento: 2018-05-31\n',
                'Método de Pago: Transferencia (Código: 04)\n',
                'Cuenta Destino: ES78 0049 0275 1723 1065 5923',
              ],
            },
          ],
      
          // Estilos personalizados
          styles: {
            vendedorHeader: {
              fontSize: 12,
              bold: true,
              margin: [0, 0, 0, 5],
            },
            facturaHeader: {
              fontSize: 12,
              bold: true,
              margin: [0, 0, 0, 5],
            },
            sectionHeader: {
              fontSize: 14,
              bold: true,
              margin: [0, 10, 0, 10],
            },
          },
        }
      }
    
}


function removeNamespace(name: string): string {
    return name.split(':').pop();
}
