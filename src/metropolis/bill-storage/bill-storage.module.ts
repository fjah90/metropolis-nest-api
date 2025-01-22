import { Module } from '@nestjs/common';
import { BillStorageService } from './bill-storage.service';
import { BillStorageController } from './bill-storage.controller';
import { PrismaService } from 'prisma/prisma.service';

@Module({
  controllers: [BillStorageController],
  providers: [BillStorageService, PrismaService],
  exports: [BillStorageService],
})
export class BillStorageModule {}
