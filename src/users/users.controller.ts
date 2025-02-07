import {
  Controller,
  Get,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';

@ApiBearerAuth()
@ApiTags('users')
@Controller('users')
@UseGuards(AuthGuard)
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
  async softDelete(@Param('id', ParseIntPipe) id: string) {
    return this.usersService.softDelete(Number(id));
  }

  // Eliminar físico (eliminar de la base de datos)
  @Delete(':id/hard-delete')
  async hardDelete(@Param('id', ParseIntPipe) id: string) {
    return this.usersService.hardDelete(Number(id));
  }
}