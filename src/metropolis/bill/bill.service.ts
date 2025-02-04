import { Injectable } from '@nestjs/common';
import { parseString } from 'xml2js';
import { BillDto } from './dto/bill.dto';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { TDocumentDefinitions, Content } from 'pdfmake/interfaces';
import { PdfSigningService } from '../pdf-signing/pdf-signing.service';
import { PageSizes } from 'pdf-lib';
import moment from 'moment';

@Injectable()
export class BillService {
  constructor(
    private readonly pdfSigningService: PdfSigningService
  ) { }

  async convertirXmlAJson(xml: any): Promise<BillDto> {
    console.log(xml)

    return new Promise((resolve, reject) => {
      parseString(
        xml,
        { explicitArray: false, tagNameProcessors: [removeNamespace] },
        async (err, result) => {
          if (err) {
            reject(err);
          } else {
            try {
              const timestamp = moment().format('DDMMYYYYHHmmss');

              const bille = result.Bille;
              const invoice = bille.Invoices.Invoice;
              const parties = bille.Parties;

              const tax = invoice.TaxesOutputs.Tax;
              const paymentDetails = invoice.PaymentDetails.Installment;
              const items = invoice.Items;
              const itemsInvoiceLine = items.InvoiceLine;

              const fileName = `factura-N-${invoice.InvoiceHeader.InvoiceNumber}_${timestamp}`;

              // console.log(Array.isArray(itemsInvoiceLine))
              const xmlDetails = await this.pdfSigningService.signXml(xml, `${fileName}.xml`);

              const billData = {
                fileName,
                encabezadoArchivo: {
                  schemaVersion: bille.FileHeader.SchemaVersion,
                  modalidad: bille.FileHeader.Modality,
                  tipoEmisorBill: bille.FileHeader.InvoiceIssuerType,
                  lote: {
                    identificadorLote: bille.FileHeader.Batch.BatchIdentifier,
                    cantidadBills: bille.FileHeader.Batch.InvoicesCount,
                    totalBillsImporte: bille.FileHeader.Batch.TotalInvoicesAmount.TotalAmount,
                    totalPendiente: bille.FileHeader.Batch.TotalOutstandingAmount.TotalAmount,
                    totalEjecutable: bille.FileHeader.Batch.TotalExecutableAmount.TotalAmount,
                    codigoMoneda: bille.FileHeader.Batch.InvoiceCurrencyCode,
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
                bill: {
                  numeroBill: invoice.InvoiceHeader.InvoiceNumber,
                  codigoSerieBill: invoice.InvoiceHeader.InvoiceSeriesCode,
                  tipoDocumentoBill: invoice.InvoiceHeader.InvoiceDocumentType,
                  claseBill: invoice.InvoiceHeader.InvoiceClass,
                  datosEmision: {
                    fechaEmision: invoice.InvoiceIssueData.IssueDate,
                    fechaOperacion: invoice.InvoiceIssueData.OperationDate,
                    periodoBillcion: {
                      inicio: invoice.InvoiceIssueData.InvoicingPeriod.StartDate,
                      fin: invoice.InvoiceIssueData.InvoicingPeriod.EndDate,
                    },
                    codigoMonedaBill: invoice.InvoiceIssueData.InvoiceCurrencyCode,
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
                items: Array.isArray(itemsInvoiceLine) ? itemsInvoiceLine.map(item => ({
                  referenciaTransaccion: item?.IssuerTransactionReference,
                  descripcionItem: item.ItemDescription,
                  cantidad: item.Quantity,
                  unidadMedida: item.UnitOfMeasure,
                  precioUnitarioSinImpuesto: item.UnitPriceWithoutTax,
                  costeTotal: item.TotalCost,
                  importeBruto: item.GrossAmount,
                })) : {
                  referenciaTransaccion: itemsInvoiceLine?.IssuerTransactionReference,
                  descripcionItem: itemsInvoiceLine.ItemDescription,
                  cantidad: itemsInvoiceLine.Quantity,
                  unidadMedida: itemsInvoiceLine.UnitOfMeasure,
                  precioUnitarioSinImpuesto: itemsInvoiceLine.UnitPriceWithoutTax,
                  costeTotal: itemsInvoiceLine.TotalCost,
                  importeBruto: itemsInvoiceLine.GrossAmount,
                },
              };
              // console.log(billData)

              const billDto = plainToClass(BillDto, billData);
              validate(billDto && xmlDetails).then((errors) => {
                if (errors.length > 0) {
                  reject(errors);
                } else {
                  resolve(billDto);
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

  async convertirXmlToJsonAndGetPDF(xml: any): Promise<{ pdfFileName: string; pdfUrl: string, xmlFileName: string; xmlUrl: string }> {
    // Convertir XML a JSON
    const json = await this.convertirXmlAJson(xml);

    console.log(json)
    // Firma el XML
    const xmlDetails = await this.pdfSigningService.signXml(xml, `${json.fileName}.xml`);  // Firma del XML

    const { xmlFileName, xmlUrl } = xmlDetails;
    // Generar y firmar PDF
    const pdfDetails = await this.generatePdfFromJson(json);

    const { pdfFileName, pdfUrl } = pdfDetails;

    return { pdfFileName, pdfUrl, xmlFileName, xmlUrl };
  }

  async generatePdfFromJson(jsonData: any): Promise<{ id: number, pdfFileName: string; pdfUrl: string, xmlFileName: string, xmlUrl: string }> {
    try {

      const docDefinition: any = await this.billReport(jsonData);

      const { id, pdfFileName, pdfUrl, xmlFileName, xmlUrl } = await this.pdfSigningService.signPdf(docDefinition, jsonData.fileName);
      return { id, pdfFileName, pdfUrl, xmlFileName, xmlUrl };

    } catch (error) {
      console.error('Error al generar el PDF:', error);
      throw error;
    }
  }

  async billReport(jsonData?: any): Promise<TDocumentDefinitions> {
    const logo: Content = {
      image: 'public/assets/logo-metropolis-oficial.png',
      width: 120,
      alignment: 'left',
    };
    // console.log(jsonData)

    //Lote
    const { identificadorLote } = jsonData.encabezadoArchivo.lote //identificadorLote, cantidadBills, totalBillsImporte, totalPendiente, totalEjecutable, codigoMoneda

    //centrosAdministrativos
    const { centrosAdministrativos } = jsonData.comprador// centrosAdministrativos es un arreglo con varios dentro, ajustar pendinte

    // vendedor
    const { nombreEmpresaVendedora } = jsonData.vendedor
    const empresaVendedoraName = `${nombreEmpresaVendedora} `
    const { Address, PostCode, Town, Province, CountryCode } = jsonData?.vendedor.direccionEmpresaVendedora; //Address, PostCode, Town, Province, CountryCode
    const addressSinFormatos = Address.replace(/\s+/g, ' ');

    const direccionCompleta = `${addressSinFormatos}, ${PostCode}, ${Town}, ${Province}, ${CountryCode} `;
    const { Telephone, ElectronicMail } = jsonData?.vendedor.detallesContactoVendedora; //Telephone, ElectronicMail, ContactPersons
    const { TaxIdentificationNumber } = jsonData?.vendedor.identificacionFiscal; //PersonTypeCode, ResidenceTypeCode, TaxIdentificationNumber

    const direccionConcatenada = `${direccionCompleta} \nTeléfono: ${Telephone} \nEmail: ${ElectronicMail} \nNIF: ${TaxIdentificationNumber} `;

    // bill
    const { numeroBill, codigoSerieBill, tipoDocumentoBill, claseBill } = jsonData?.bill; // numeroBill, codigoSerieBill, tipoDocumentoBill, claseBill
    const { fechaEmision, fechaOperacion, codigoMonedaBill, periodoBillcion, codigoMonedaImpuestos, idioma } = jsonData?.bill.datosEmision; //fechaEmision, fechaOperacion, periodoBillcion[object], codigoMonedaBill, codigoMonedaImpuestos, idioma
    // console.log(periodoBillcion)
    const billConcatenda = `Número de Factura: ${numeroBill} \nCodigo de serie Factura: ${codigoSerieBill} \nTipo Documento: ${tipoDocumentoBill} \nClase Factura: ${claseBill} \nFecha de Emisión: ${fechaEmision} \nFecha de Operación: ${fechaOperacion} \nCodigo de Moneda: ${codigoMonedaBill} \nCodigo De Impuesto de Moneda: ${codigoMonedaImpuestos} \nIdioma: ${idioma} \nPeriodo de Facturación: ${periodoBillcion.inicio} -${periodoBillcion.fin} `;

    //Comprador
    const { nombreEmpresaCompradora } = jsonData.comprador //nombreEmpresaCompradora
    const { Address: addressComprador, PostCode: postCodeComprador, Town: townComprador, Province: provinceComprador, CountryCode: countryCodeComprador } = jsonData?.comprador.direccionEmpresaCompradora; //Address, PostCode, Town, Province, CountryCode pero de comprador
    const { ContactPersons } = jsonData.comprador.detallesContactoCompradora//ContactPersons esta vacio
    const { PersonTypeCode, ResidenceTypeCode, TaxIdentificationNumber: TaxIdentificationNumberComprador } = jsonData?.comprador.identificacionFiscal;//PersonTypeCode, ResidenceTypeCode TaxIdentificationNumberComprador
    const direccionCompletaComprador = `Nombre: ${nombreEmpresaCompradora} \nDirección:${addressComprador.trim()}, ${postCodeComprador.trim()}, ${townComprador.trim()}, ${provinceComprador.trim()}, ${countryCodeComprador.trim()} \nNIF:${TaxIdentificationNumberComprador} `;
    const informacionJuridicaComprador = `${PersonTypeCode},${ResidenceTypeCode}, `
    // console.log(direccionCompletaComprador)

    //items
    const items = Array.isArray(jsonData.items) ? jsonData.items : [jsonData.items]; //`${ descripcionItem }, referenciaTransaccion, importeBruto, ${ cantidad }, ${ precioUnitarioSinImpuesto }, ${ costeTotal }, ${ unidadMedida } `

    //detallespago
    const { fechaVencimiento, importeVencimiento, metodoPago, cuentaDestino } = jsonData.detallesPago; //fechaVencimiento, importeVencimiento, metodoPago, cuentaDestino
    const detallesPago = `Fecha de Vencimiento: ${fechaVencimiento} \nImporte de Vencimiento: ${importeVencimiento} EUR\nMétodo de Pago: #${metodoPago} \nCuenta Destino: ${cuentaDestino} `

    //Totales
    const { importeBruto, importeBrutoAntesImpuestos, totalImpuestos, impuestosRetenidos, importeTotal, totalPendiente, totalEjecutable } = jsonData.totales //importeBruto, importeBrutoAntesImpuestos, totalImpuestos, impuestosRetenidos, importeTotal, totalPendiente, totalEjecutable

    //impuestos
    const { tasaImpuesto } = jsonData.impuestos //tipoImpuesto, tasaImpuesto, baseImponible, importeImpuesto, recargoEquivalencia}
    const { datosAdicionales } = jsonData.datosAdicionales //datosAdicionales

    return {
      pageSize: 'A4',
      pageMargins: [40, 100, 40, 60],
      header: (currentPage, pageCount) => {
        return {
          margin: [40, 20, 40, 0],
          stack: [
            {
              text: 'Factura Electrónica',
              alignment: 'center',
              fontSize: 18,
              bold: true,
              margin: [0, 10, 0, 20],
            },
            {
              // columns: [
              //   {
              //     stack: [
              //       logo,
              //       {
              //         text: empresaVendedoraName ?? 'Metrópolis Comunicación S.L.U. Prueba',
              //         style: 'vendedorHeader',
              //         margin: [0, 10, 0, 0],
              //       },
              //       {
              //         text: direccionConcatenada ?? 'Prueba Plaza Doctor Olivera, 15 1ºB\n38202, La Laguna, S/C de Tenerife, ESP\nTeléfono: 922265552\nEmail: sandra@metropoliscom.com\nNIF: B38402756',
              //       },
              //     ],
              //     width: '*',
              //   },
              //   {
              //     stack: [
              //       {
              //         text: 'Factura',
              //         style: 'billHeader',
              //       },
              //       {
              //         text: billConcatenda ?? 'pruebaNúmero de Factura: 10200\nTipo Documento: FC\nClase Factura: OO\nFecha de Emisión: 2018-05-31\nPeriodo de Facturación: 01/05/2018 - 31/05/2018, datos de prueba',
              //       },
              //     ],
              //     alignment: 'right',
              //     width: '*',
              //   },
              // ],
            },
          ],
        } as Content;
      },
      footer: (currentPage, pageCount) => {
        return {
          text: `Página ${currentPage} de ${pageCount} `,
          alignment: 'right',
          margin: [50, 20, 30, 20],//eje x,y extraño
          fontSize: 8,
        };
      },
      content: [
        {
          columns: [
            {
              stack: [
                logo,
                {
                  text: empresaVendedoraName ?? 'Metrópolis Comunicación S.L.U. Prueba',
                  style: 'vendedorHeader',
                  margin: [0, 10, 0, 0],
                },
                {
                  text: direccionConcatenada ?? 'Prueba Plaza Doctor Olivera, 15 1ºB\n38202, La Laguna, S/C de Tenerife, ESP\nTeléfono: 922265552\nEmail: sandra@metropoliscom.com\nNIF: B38402756',
                },
              ],
              width: '*',
            },
            {
              stack: [
                {
                  text: 'Factura',
                  style: 'billHeader',
                },
                {
                  text: billConcatenda ?? 'pruebaNúmero de Factura: 10200\nTipo Documento: FC\nClase Factura: OO\nFecha de Emisión: 2018-05-31\nPeriodo de Facturación: 01/05/2018 - 31/05/2018, datos de prueba',
                },
              ],
              alignment: 'right',
              width: '*',
            },
          ],
        },
        // Información del comprador
        {
          text: 'Datos del Comprador',
          style: 'sectionHeader',
        },
        {
          text: direccionCompletaComprador ?? [
            'Nombre: Fundación Mapfre Guanarteme prueba\n',
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
            widths: ['auto', 'auto', 'auto', 'auto'],
            body: [
              [
                { text: 'Descripción', bold: true, style: 'tableProductsLeft' },
                { text: 'Cant.', bold: true, style: 'tableProductsLeft' },
                { text: 'Precio Unitario', bold: true, style: 'tableProductsLeft' },
                { text: 'Coste Total', bold: true, style: 'tableProductsLeft' },
              ],
              ...items.map(item => [
                { text: item.descripcionItem, style: 'tableProductsCenter' },
                { text: item.cantidad, style: 'tableProductsCenter' },
                { text: (Number(item.precioUnitarioSinImpuesto) || 0).toFixed(2) + ' EUR', style: 'tableProductsCenter' },
                { text: (Number(item.costeTotal) || 0).toFixed(2) + ' EUR', style: 'tableProductsCenter' },
              ])
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
              [{ text: 'Importe Bruto:', bold: true }, `${importeBruto} EUR`],
              [{ text: `Total Impuestos ${tasaImpuesto}% `, bold: true }, `${totalImpuestos} EUR`],
              [{ text: 'Importe Total:', bold: true }, `${importeTotal} EUR`],
              [{ text: 'Total Pendiente:', bold: true }, `${totalPendiente} EUR`],
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
          text: jsonData.detallesPago ? detallesPago : [
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
        billHeader: {
          fontSize: 12,
          bold: true,
          margin: [0, 0, 0, 5],
        },
        sectionHeader: {
          fontSize: 14,
          bold: true,
          margin: [0, 10, 0, 10],
        },
        tableProductsCenter: {
          alignment: 'center',
          fontSize: 10,
        },
        tableProductsLeft: {
          alignment: 'left',
          fontSize: 12,
        },
      },
    };
  }
}

function removeNamespace(name: string): string {
  return name.split(':').pop();
}
