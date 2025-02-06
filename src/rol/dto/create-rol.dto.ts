import { IsString, IsNotEmpty } from 'class-validator';

export class CreateRolDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre del rol no puede estar vacío' })
  name: string;
}