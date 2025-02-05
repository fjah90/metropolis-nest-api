import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // Método para crear un nuevo usuario
  async create(createUserDto: CreateUserDto) {
    const { username, email, password, rolNombre } = createUserDto;

     // Validar que el rol sea "admin" o "usuario"
     if (!['admin', 'usuario'].includes(rolNombre)) {
      throw new BadRequestException('Rol no válido. Debe ser "admin" o "usuario".');
    }
    const existingUser = await this.prisma.users.findUnique({ where: { email } });
    if (existingUser) {
      throw new ConflictException('El email ya está registrado.');
    }

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Buscar o crear el rol
    let rol = await this.prisma.rol.findUnique({ where: { name: rolNombre } });
    if (!rol) {
      rol = await this.prisma.rol.create({ data: { name: rolNombre } });
    }

    // Crear el usuario en la base de datos
    return this.prisma.users.create({
      data: {
        username,
        email,
        password: hashedPassword,
        rolId: rol.id,
      },
    });
  }

  // Método para obtener todos los usuarios
  async findAll() {
    return this.prisma.users.findMany({
      where: { is_deleted: false }, // Solo usuarios no eliminados lógicamente
      include: { rol: true }, // Incluir la relación con Rol
    });
  }

  // Listar un usuario por ID
  async findOne(id: number) {
  const user = await this.prisma.users.findUnique({
    where: { id },
    include: { rol: true }, // Incluir la relación con Rol
  });

  if (!user) {
    throw new NotFoundException('Usuario no encontrado');
  }

  return user;
}

  // Eliminar lógico (soft delete)
  async softDelete(id: number) {
    const user = await this.prisma.users.update({
      where: { id },
      data: { is_deleted: true }, // Marcar como eliminado lógicamente
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return { message: 'Usuario eliminado lógicamente' };
  }

  // Eliminar físico (eliminar de la base de datos)
 // Eliminar físico (eliminar de la base de datos)
async hardDelete(id: number) {
  const user = await this.prisma.users.delete({
    where: { id },
  });

  if (!user) {
    throw new NotFoundException('Usuario no encontrado');
  }

  return { message: 'Usuario eliminado físicamente' };
}
}