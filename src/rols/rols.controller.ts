import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { RolsGuard } from '../auth/auth.rols.guard';
import { UsersService } from '../users/users.service';
import { CreateRolDto } from './dto/create-rols.dto';
import { RolsService } from './rols.service';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('rols')
@UseGuards(AuthGuard, RolsGuard) // Aplicar ambos guards
export class RolController { // Cambiar el nombre aquí
  constructor(
    private readonly rolsService: RolsService,
    private readonly usersService: UsersService,
  ) { }

  // Listar todos los rols
  @Get()
  async findAll() {
    return this.rolsService.findAll();
  }

  // Buscar un rol por ID
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.rolsService.findOne(Number(id));
  }

  // Crear un nuevo rol
  @Post()
  async create(@Body() createRolDto: CreateRolDto) {
    return this.rolsService.create(createRolDto);
  }

  // Eliminar un rol
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    return this.rolsService.delete(Number(id));
  }

  // Cambiar el rol de un usuario por ID
  @Put('change-rol/:userId')
  async changeUserRole(
    @Param('userId') userId: string,
    @Body('rolId') rolId: number,
  ) {
    return this.usersService.changeUserRole(Number(userId), rolId);
  }
}