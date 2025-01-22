import { IsBoolean, IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class CreateBillStorageDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsUrl()
  @IsNotEmpty()
  download_url: string;

  @IsBoolean()
  @IsNotEmpty()
  is_deleted: boolean;
}
