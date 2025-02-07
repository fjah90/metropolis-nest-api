import { IsBoolean, IsNotEmpty, IsNumber, IsString, IsUrl } from 'class-validator';

export class CreateBillStorageDto {
  @IsString()
  @IsNotEmpty()
  pdf_name: string;

  @IsString()
  @IsNotEmpty()
  xml_name: string;

  @IsUrl()
  @IsNotEmpty()
  pdf_url: string;

  @IsUrl()
  @IsNotEmpty()
  xml_url: string;

  @IsBoolean()
  @IsNotEmpty()
  is_deleted: boolean;

  @IsNumber()
  user_id: number;
}
