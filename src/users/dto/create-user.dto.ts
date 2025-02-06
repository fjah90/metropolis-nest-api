import { IsString, IsEmail, MinLength, IsNotEmpty, IsIn, IsNumber, IsInt } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre de usuario no puede estar vacío' })
  @MinLength(3, { message: 'El nombre de usuario debe tener al menos 3 caracteres' })
  readonly username: string;

  @IsEmail({}, { message: 'El email debe ser válido' })
  @IsNotEmpty({ message: 'El email no puede estar vacío' })
  readonly email: string;

  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  @IsNotEmpty({ message: 'La contraseña no puede estar vacía' })
  readonly password: string;

  @IsInt({ message: 'Ingrese un rol correcto' })
  // @IsNotEmpty({ message: 'El rol no puede estar vacío' })
  @IsIn([1, 2], { message: 'El Rol Asignado no existe ' })
  readonly rolId: number = 2;
}