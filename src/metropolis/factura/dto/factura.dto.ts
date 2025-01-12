import { IsNumber, IsString, IsISO8601 } from 'class-validator';
export class FacturaDto {

 @IsString()
 numeroFactura: string;

 @IsISO8601()
 fechaEmision: string;
 
 @IsNumber()
 total: number;
}