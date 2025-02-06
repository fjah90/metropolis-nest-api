import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateRolDto } from './dto/create-rol.dto';

@Injectable()
export class RolService {
  constructor(private prisma: PrismaService) {}

  // Listar todos los roles
  async findAll() {
    return this.prisma.rol.findMany();
  }

  // Buscar un rol por ID
  async findOne(id: number) {
    const role = await this.prisma.rol.findUnique({
      where: { id },
    });

    if (!role) {
      throw new NotFoundException('Rol no encontrado');
    }

    return role;
  }

  // Crear un nuevo rol
  async create(createRolDto: CreateRolDto) {
    const { name } = createRolDto;

    // Verificar si el rol ya existe
    const existingRole = await this.prisma.rol.findUnique({ where: { name } });
    if (existingRole) {
      throw new Error('El rol ya existe.');
    }

    return this.prisma.rol.create({
      data: { name },
    });
  }

  // Eliminar un rol
  async delete(id: number) {
    const role = await this.prisma.rol.delete({
      where: { id },
    });

    if (!role) {
      throw new NotFoundException('Rol no encontrado');
    }

    return { message: 'Rol eliminado exitosamente' };
  }
}