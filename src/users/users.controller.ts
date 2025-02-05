import {
  Controller,
  Get,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Listar todos los usuarios
  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  // Listar un usuario por ID
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(Number(id));
  }

  // Eliminar lógico (soft delete)
  @Delete(':id/soft-delete')
  async softDelete(@Param('id') id: string) {
    return this.usersService.softDelete(Number(id));
  }

  // Eliminar físico (eliminar de la base de datos)
  @Delete(':id/hard-delete')
  @HttpCode(HttpStatus.NO_CONTENT) // Código de estado 204 para eliminación exitosa
  async hardDelete(@Param('id') id: string) {
    return this.usersService.hardDelete(Number(id));
  }
}