import { Injectable } from '@nestjs/common';
import { parseString } from 'xml2js';
import { FacturaDto } from './dto/factura.dto';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

@Injectable()
export class FacturaService {
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
}

function removeNamespace(name: string): string {
    return name.split(':').pop();
}
