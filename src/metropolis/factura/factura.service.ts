import { Injectable } from '@nestjs/common';
import { parseString } from 'xml2js';
import { FacturaDto } from './dto/factura.dto';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { Factura } from './entities/factura.entity';
@Injectable()
export class FacturaService {
    async convertirXmlAJson(xml: any): Promise<FacturaDto> {
    return new Promise((resolve, reject) => {
    parseString(
    xml,
    { explicitArray: false, tagNameProcessors: [removeNamespace] }, // Ignorar los prefijos de espacio de nombres
    (err, result) => {
    if (err) {
    reject(err);
    } else {
    try {
    // Extraemos los datos necesarios de la estructura del XML
    const invoice = result.Facturae.Invoices.Invoice;
    const parties = result.Facturae.Parties;
    const facturaData = {
        vendedor: {
            nombreEmpresaVendedora: parties.SellerParty.LegalEntity.CorporateName,
            direccionEmpresaVendedora:parties.SellerParty.LegalEntity.AddressInSpain,
            detallesContactoVendedora:parties.SellerParty.LegalEntity.ContactDetails,
        },
        comprador: {
            nombreEmpresaCompradora: parties.BuyerParty.LegalEntity.CorporateName,
            direccionEmpresaCompradora:parties.BuyerParty.LegalEntity.AddressInSpain,
            detallesContactoCompradora:parties.BuyerParty.LegalEntity.ContactDetails,
        },

        bruto:invoice.InvoiceTotals.TotalGrossAmount,
            numeroFactura: invoice.InvoiceHeader.InvoiceNumber,
            fechaEmision: invoice.InvoiceIssueData.IssueDate,
            IdentificadorLote: invoice.BatchIdentifier,
            total: parseFloat(invoice.InvoiceTotals.InvoiceTotal),
 
    };
    // Convertimos el objeto al DTO y validamos
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
    },
    );
    });
    }
    
    }
    // Función para eliminar los prefijos de espacio de nombres
function removeNamespace(name: string): string {
    return name.split(':').pop();
   }