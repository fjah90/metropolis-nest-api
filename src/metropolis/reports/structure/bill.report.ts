import { TDocumentDefinitions, Content } from 'pdfmake/interfaces';

// Logo de la empresa
const logo: Content = {
  image: 'public/assets/logo-metropolis-oficial.png',
  width: 120,
  alignment: 'left',
};

// Generación del reporte de la factura
export const billReport = (): TDocumentDefinitions => {
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
                text: 'Metrópolis Comunicación S.L.U.',
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
  };
};
