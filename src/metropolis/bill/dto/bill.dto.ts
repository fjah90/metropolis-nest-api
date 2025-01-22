import { IsNumber, IsString, IsISO8601 } from 'class-validator';
export class BillDto {
  FileHeader: {
    SchemaVersion: string; // Versión del esquema (e.g., "3.2")
    Modality: string; // Modalidad (e.g., "I")
    InvoiceIssuerType: string; // Tipo de emisor (e.g., "EM")
    Batch: {
      BatchIdentifier: string; // Identificador del lote
      InvoicesCount: number; // Número de facturas
      TotalInvoicesAmount: {
        TotalAmount: number; // Importe total de las facturas
      };
      TotalOutstandingAmount: {
        TotalAmount: number; // Importe pendiente total
      };
      TotalExecutableAmount: {
        TotalAmount: number; // Importe ejecutable total
      };
      InvoiceCurrencyCode: string; // Código de moneda (e.g., "EUR")
    };
  };

  Parties: {
    SellerParty: {
      TaxIdentification: {
        PersonTypeCode: string; // Código de tipo de persona (e.g., "J")
        ResidenceTypeCode: string; // Código de residencia (e.g., "R")
        TaxIdentificationNumber: string; // Número de identificación fiscal
      };
      LegalEntity: {
        CorporateName: string; // Nombre corporativo
        AddressInSpain: {
          Address: string; // Dirección
          PostCode: string; // Código postal
          Town: string; // Ciudad
          Province: string; // Provincia
          CountryCode: string; // Código de país (e.g., "ESP")
        };
        ContactDetails: {
          Telephone?: string; // Teléfono (opcional)
          ElectronicMail?: string; // Correo electrónico (opcional)
          ContactPersons?: string; // Personas de contacto (opcional)
        };
      };
    };

    BuyerParty: {
      TaxIdentification: {
        PersonTypeCode: string;
        ResidenceTypeCode: string;
        TaxIdentificationNumber: string;
      };
      AdministrativeCentres: {
        AdministrativeCentre: {
          CentreCode?: string; // Código del centro (opcional)
          RoleTypeCode: string; // Código del rol (e.g., "01", "02", "03")
          Name?: string; // Nombre (opcional)
          AddressInSpain: {
            Address: string;
            PostCode: string;
            Town: string;
            Province: string;
            CountryCode: string;
          };
          CentreDescription?: string; // Descripción del centro (opcional)
        }[];
      };
      LegalEntity: {
        CorporateName: string;
        AddressInSpain: {
          Address: string;
          PostCode: string;
          Town: string;
          Province: string;
          CountryCode: string;
        };
        ContactDetails: {
          ContactPersons?: string; // Personas de contacto (opcional)
        };
      };
    };
  };

  Invoices: {
    Invoice: {
      InvoiceHeader: {
        InvoiceNumber: string; // Número de factura
        InvoiceSeriesCode?: string; // Código de serie (opcional)
        InvoiceDocumentType: string; // Tipo de documento (e.g., "FC")
        InvoiceClass: string; // Clase de factura (e.g., "OO")
      };
      InvoiceIssueData: {
        IssueDate: string; // Fecha de emisión (YYYY-MM-DD)
        OperationDate?: string; // Fecha de operación (opcional)
        InvoicingPeriod: {
          StartDate: string; // Fecha de inicio del periodo
          EndDate: string; // Fecha de fin del periodo
        };
        InvoiceCurrencyCode: string;
        TaxCurrencyCode: string;
        LanguageName: string; // Idioma (e.g., "es")
      };
      TaxesOutputs: {
        Tax: {
          TaxTypeCode: string; // Código de tipo de impuesto
          TaxRate: number; // Tasa de impuesto
          TaxableBase: {
            TotalAmount: number; // Base imponible
          };
          TaxAmount: {
            TotalAmount: number; // Importe del impuesto
          };
          EquivalenceSurchargeAmount: {
            TotalAmount: number; // Importe del recargo de equivalencia
          };
        }[];
      };
      InvoiceTotals: {
        TotalGrossAmount: number; // Importe bruto total
        TotalGrossAmountBeforeTaxes: number; // Importe bruto antes de impuestos
        TotalTaxOutputs: number; // Importe total de impuestos
        TotalTaxesWithheld: number; // Impuestos retenidos
        InvoiceTotal: number; // Total de la factura
        TotalOutstandingAmount: number; // Total pendiente
        TotalExecutableAmount: number; // Total ejecutable
      };
      Items: {
        InvoiceLine: {
          IssuerTransactionReference?: string; // Referencia de la transacción (opcional)
          ItemDescription: string; // Descripción del ítem
          Quantity: number; // Cantidad
          UnitOfMeasure: string; // Unidad de medida
          UnitPriceWithoutTax: number; // Precio unitario sin impuestos
          TotalCost: number; // Coste total
          GrossAmount: number; // Importe bruto
          TaxesOutputs: {
            Tax: {
              TaxTypeCode: string;
              TaxRate: number;
              TaxableBase: {
                TotalAmount: number;
              };
              TaxAmount: {
                TotalAmount: number;
              };
              EquivalenceSurchargeAmount: {
                TotalAmount: number;
              };
            }[];
          };
          AdditionalLineItemInformation?: string; // Información adicional (opcional)
        }[];
      };
      PaymentDetails: {
        Installment: {
          InstallmentDueDate: string; // Fecha de vencimiento
          InstallmentAmount: number; // Importe del pago
          PaymentMeans: string; // Método de pago (e.g., "04")
          AccountToBeCredited: {
            IBAN: string; // Cuenta IBAN
          };
        }[];
      };
      AdditionalData: {
        InvoiceAdditionalInformation: string; // Información adicional de la factura
      };
    }[];
  };
}
