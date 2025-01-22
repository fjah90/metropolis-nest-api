import { PartialType } from '@nestjs/mapped-types';
import { CreateBillStorageDto } from './create-bill-storage.dto';

export class UpdateBillStorageDto extends PartialType(CreateBillStorageDto) {}
