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
import { RolesGuard } from '../auth/auth.roles.guard';
import { UsersService } from '../users/users.service';
import { CreateRolDto } from './dto/create-rol.dto';
import { RolService } from './rol.service';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('roles')
@UseGuards(AuthGuard, RolesGuard) // Aplicar ambos guards
export class RolController { // Cambiar el nombre aquí
  constructor(
    private readonly rolesService: RolService,
    private readonly usersService: UsersService,
  ) {}

  // Listar todos los roles
  @Get()
  async findAll() {
    return this.rolesService.findAll();
  }

  // Buscar un rol por ID
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.rolesService.findOne(Number(id));
  }

  // Crear un nuevo rol
  @Post()
  async create(@Body() createRolDto: CreateRolDto) {
    return this.rolesService.create(createRolDto);
  }

  // Eliminar un rol
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    return this.rolesService.delete(Number(id));
  }

  // Cambiar el rol de un usuario por ID
  @Put('change-role/:userId')
  async changeUserRole(
    @Param('userId') userId: string,
    @Body('roleId') roleId: number,
  ) {
    return this.usersService.changeUserRole(Number(userId), roleId);
  }
}