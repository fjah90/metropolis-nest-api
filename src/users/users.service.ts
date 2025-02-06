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
    const { username, email, password, rolId } = createUserDto;

     // Validar que el rol sea "admin" o "usuario"
     if (![ 1, 2 ].includes(rolId)) {
      throw new BadRequestException('Rol ID no válido.');
    }
    const existingUser = await this.prisma.users.findUnique({ where: { email } });
    if (existingUser) {
      throw new ConflictException('El email ya está registrado.');
    }

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // // Buscar o crear el rol
    // let rol = await this.prisma.rol.findUnique({ where: { id: rolId } });
    // if (!rol) {
    //   rol = await this.prisma.rol.create({ data: { id: rolId } });
    // }

    // Crear el usuario en la base de datos
    await this.prisma.users.create({
      data: {
        username,
        email,
        password: hashedPassword,
        rolId
      },
    });
    return { message: 'El usuario se ha creado exitosamente' };
  }

  // Método para obtener todos los usuarios
  async findAll() {
    return this.prisma.users.findMany({
      where: { is_deleted: false }, // Solo usuarios no eliminados lógicamente
      include: { rol: true }, // Incluir la relación con Rol
    });
  }

  // Listar un usuario por ID
  // Buscar un usuario por ID o email
  async findOne(identifier: number | string) {
    let user;

    if (typeof identifier === 'number') {
      // Buscar por ID
      user = await this.prisma.users.findUnique({
        where: { id: identifier },
        include: { rol: true }, // Incluir los datos del rol relacionado
      });
    } else if (typeof identifier === 'string') {
      // Buscar por email
      user = await this.prisma.users.findUnique({
        where: { email: identifier },
        include: { rol: true }, // Incluir los datos del rol relacionado
      });
    }

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return user;
  }

  // Eliminar lógico (soft delete)
  async softDelete(id: number) {
    // Verificar si el usuario existe
    const user = await this.prisma.users.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Marcar como eliminado lógicamente
    await this.prisma.users.update({
      where: { id },
      data: { is_deleted: true },
    });

    return { message: `Usuario con el ID ${id} marcado como eliminado` };
  }

   // Eliminar físico (eliminar de la base de datos)
   async hardDelete(id: number) {
    // Verificar si el usuario existe
    const user = await this.prisma.users.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Eliminar el usuario
    await this.prisma.users.delete({
      where: { id },
    });

    return { message: 'Usuario eliminado físicamente' };
  }


   // Método para cambiar el rol de un usuario
   async changeUserRole(userId: number, roleId: number) {
    // Verificar si el rol existe
    const role = await this.prisma.rol.findUnique({ where: { id: roleId } });
    if (!role) {
      throw new NotFoundException('Rol no encontrado');
    }

    // Verificar si el usuario existe
    const user = await this.prisma.users.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Actualizar el rol del usuario
    return this.prisma.users.update({
      where: { id: userId },
      data: { rolId: roleId },
    });
  }
}