import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateRolDto } from './dto/create-rols.dto';

@Injectable()
export class RolsService {
  constructor(private prisma: PrismaService) { }

  // Listar todos los rols
  async findAll() {
    return this.prisma.rols.findMany();
  }

  // Buscar un rol por ID
  async findOne(id: number) {
    const rol = await this.prisma.rols.findUnique({
      where: { id },
    });

    if (!rol) {
      throw new NotFoundException('Rol no encontrado');
    }

    return rol;
  }

  // Crear un nuevo rol
  async create(createRolDto: CreateRolDto) {
    const { name } = createRolDto;

    // Verificar si el rol ya existe
    const existingRole = await this.prisma.rols.findUnique({ where: { name } });
    if (existingRole) {
      throw new Error('El rol ya existe.');
    }

    return this.prisma.rols.create({
      data: { name },
    });
  }

  // Eliminar un rol
  async delete(id: number) {
    const rol = await this.prisma.rols.delete({
      where: { id },
    });

    if (!rol) {
      throw new NotFoundException('Rol no encontrado');
    }

    return { message: 'Rol eliminado exitosamente' };
  }
}