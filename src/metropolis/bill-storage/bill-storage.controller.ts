import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException, UseGuards } from '@nestjs/common';
import { BillStorageService } from './bill-storage.service';
import { CreateBillStorageDto } from './dto/create-bill-storage.dto';
import { UpdateBillStorageDto } from './dto/update-bill-storage.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';

@ApiBearerAuth()
@ApiTags('bill-storage')
@Controller('bill-storage')
@UseGuards(AuthGuard)
export class BillStorageController {
  constructor(private readonly billStorageService: BillStorageService) { }

  @Get('get-bills')
  async getAllBillsStorage() {
    return this.billStorageService.getAllBillStorage();
  }

  @Post('get-by-name')
  async getBillStorageByFileName(@Body('fileName') fileName: string) {
    console.log('fileName:', fileName);
    const bill = await this.billStorageService.getBillStorageByFileName(fileName);
    if (!bill) {
      throw new NotFoundException(`Factura con nombre de archivo "${fileName}" no encontrada`);
    }
    return bill;
  }

  @Delete('soft-delete/:id')
  async softDeleteBill(
    @Param('id') id: string,
    @Body() data: UpdateBillStorageDto,
  ) {
    const numberId = parseInt(id, 10); // Intentamos convertir el ID a número

    // Validamos si el valor no es un número válido
    if (isNaN(numberId)) {
      throw new NotFoundException('El ID debe ser un número válido.');
    }

    const softBill = await this.billStorageService.softDeleteBill(numberId, data);

    if (!softBill) {
      throw new NotFoundException(`Factura con ID "${id}" no encontrada`);
    }

    return softBill;
  }

  @Delete('database-delete/:id')
  async deleteBill(@Param('id') id: string) {
    const numberId = parseInt(id, 10);
    const deletedBill = this.billStorageService.deleteBillById(numberId);

    if (isNaN(numberId)) {
      throw new NotFoundException(`El ID debe ser un número.`);
    }
    return deletedBill;

  }

}
