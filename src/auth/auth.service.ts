import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async signIn(username: string, pass: string): Promise<{ access_token: string }> {
    console.log('signIn method called'); // Log para verificar que el método está siendo llamado

    const user = await this.usersService.findOne(username);
    console.log('User found:', user); // Verificar si el usuario se encuentra correctamente

    if (!user) {
        console.log('User not found'); // Verificar si no encuentra el usuario
        throw new UnauthorizedException();
    }

    if (user.password !== pass) {
        console.log('Invalid password'); // Verificar si la contraseña no coincide
        throw new UnauthorizedException();
    }

    const payload = { sub: user.userId, username: user.username };
    const access_token = await this.jwtService.signAsync(payload);
    console.log('Generated token:', access_token); // Verificar si el token se genera correctamente
    return { access_token: await this.jwtService.signAsync(payload), };
}


  //constructor(private usersService: UsersService) {}


  // async signIn(username: string, pass: string): Promise<any> {
  //   const user = await this.usersService.findOne(username);
  //   if (user?.password !== pass) {
  //     throw new UnauthorizedException();
  //   }
  //   const { password, ...result } = user;
  //   // TODO: Generate a JWT and return it here
  //   // instead of the user object
  //   return result;
  // }
  
  create(createAuthDto: CreateAuthDto) {
    return 'This action adds a new auth';
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
