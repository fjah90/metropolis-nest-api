import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) { }

  async signIn(username: string, password: string): Promise<{ access_token: string }> {
    console.log('signIn method called'); // Log para verificar que el método está siendo llamado

    // Buscar el usuario por email
    const user = await this.usersService.findOne((username));
    console.log('User found:', user); // Verificar si el usuario se encuentra correctamente

    if (!user) {
      console.log('User not found'); // Verificar si no encuentra el usuario
      throw new UnauthorizedException('Usuario no encontrado');
    }

    // Comparar la contraseña ingresada con la almacenada (encriptada)
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('Password valid:', isPasswordValid); // Verificar si la contraseña coincide
    if (!isPasswordValid) {
      console.log('Invalid password'); // Verificar si la contraseña no coincide
      throw new UnauthorizedException('Contraseña incorrecta');
    }

    // Generar el payload del token JWT
    const payload = { sub: user.id, username: user.username, email: user.email, rol: user.rolId };
    const access_token = await this.jwtService.signAsync(payload);
    console.log('Generated token:', access_token); // Verificar si el token se genera correctamente

    return { access_token: await this.jwtService.signAsync(payload) };
  }

  // Método para registrar un nuevo usuario
  async signUp(createAuthDto: { username: string; email: string; password: string; rolId: number }) {
    return this.usersService.create(createAuthDto);
  }
}

