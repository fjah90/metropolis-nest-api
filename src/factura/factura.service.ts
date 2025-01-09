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
        { explicitArray: false, tagNameProcessors: [removeNamespace] }, // Ignorar los prefijos de espacio de nombres
        (err, result) => {
          if (err) {
            reject(err);
          } else {
            try {
              // Extraemos los datos necesarios de la estructura del XML
              const invoice = result.Facturae.Invoices.Invoice;
              const facturaData = {
                numeroFactura: invoice.InvoiceHeader.InvoiceNumber,
                fechaEmision: invoice.InvoiceIssueData.IssueDate,
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
