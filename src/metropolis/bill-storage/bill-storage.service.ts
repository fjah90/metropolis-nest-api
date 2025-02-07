import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBillStorageDto } from './dto/create-bill-storage.dto';
import { UpdateBillStorageDto } from './dto/update-bill-storage.dto';
import { PrismaService } from 'prisma/prisma.service';
import path from 'path';
import * as fse from 'fs-extra';

@Injectable()
export class BillStorageService {
  constructor(private readonly prisma: PrismaService) { }

  async createBill(data: CreateBillStorageDto) {
    console.log('data:', data);
    try {
      return this.prisma.bills.create({
        data: {
          pdf_name: data.pdf_name,
          xml_name: data.xml_name,
          pdf_url: data.pdf_url,
          xml_url: data.xml_url,
          is_deleted: false,
          user: {
            connect: {
              id: data.user_id, // Asocia la factura al usuario autenticado
            },
          },
        },
      });
    } catch (error) {
      console.error('Error creando registro de factura:', error);
    }
  }

  async getAllBillStorage() {
    try {
      return this.prisma.bills.findMany({
        where: {
          is_deleted: false,
        },
      });

    } catch (error) {
      console.error('Error obteniendo los registros de factura:', error);
    }
  }

  async getBillStorageByFileName(filename: string) {
    try {
      return this.prisma.bills.findUnique({
        where: {
          pdf_name: filename,
        },
      });
    } catch (error) {
      throw new NotFoundException(`Factura con nombre de archivo "${filename}" no encontrada.`);
    }
  }

  async softDeleteBill(id: number, data: UpdateBillStorageDto) {
    try {
      const updatedBill = await this.prisma.bills.update({
        where: { id: id },
        data: {
          is_deleted: true,
          update_at: new Date(),
        },
      });

      if (!updatedBill) {
        throw new NotFoundException(`Factura con ID "${id}" no encontrada.`);
      }

      return { message: `Factura con ID ${id} Eliminada. ` };
    } catch (error) {
      throw new NotFoundException(`Factura con ID "${id}" no encontrada.`);
    }

  }

  async deleteBillById(id: number): Promise<{ message: string }> {
    try {
      const isDelete = await this.deleteBillOutput(id); // TODO: cambiar por el metodo para ser borrado del servidor externo

      if (isDelete) {
        await this.prisma.bills.delete({
          where: { id },
        });
        return { message: `Factura con ID ${id} eliminada permanentemente.` };
      } else {
        throw new NotFoundException(`Factura con ID ${id} no encontrada.`);
      }

    } catch (error) {
      throw new NotFoundException(`Factura con ID ${id} no encontrada.`);
    }
  }

  async deleteBillOutput(id: number): Promise<boolean> {
    try {
      const file = await this.prisma.bills.findFirstOrThrow({
        where: { id },
      });
      const fullPathPDF = path.resolve(process.cwd(), 'public', 'output', `${file.pdf_name}`);
      const fullPathXML = path.resolve(process.cwd(), 'public', 'output', `${file.xml_name}`);
      if (!fse.existsSync) {
        throw new NotFoundException(`Factura con ID ${id} y nombre de archivo ${file.pdf_name} no encontrado.`);
      } else {
        await fse.unlink(fullPathPDF);
        await fse.unlink(fullPathXML);
      }

      return true;
    } catch (error) {
      return false;
    }
  }
}
