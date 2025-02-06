import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
// import { IS_PUBLIC_KEY, Public } from 'src/utils';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('auth')
@Controller('auth')
// @UseGuards(AuthGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiBearerAuth()
  @Post('register')
  // @UseGuards(AuthGuard)
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.signUp(createUserDto);
  }
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  // @UseGuards(AuthGuard)
  signIn(@Body() signInDto: Record<string, any>) {
    console.log('Received login request:', signInDto);
    const { email, password } = signInDto; // Asegúrate de usar 'email' en lugar de 'username'
    return this.authService.signIn(email, password);                                                                                                    return this.authService.signIn(signInDto.username, signInDto.password);
  }
  @ApiBearerAuth()
  // @Public()
  @Get('profile')
  // @UseGuards(AuthGuard)
  getProfile(@Request() req) {
    return req.user;
  }

  // @Public()
 }