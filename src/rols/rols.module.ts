import { Module } from '@nestjs/common';
import { RolsService } from './rols.service';
import { RolController } from './rols.controller';
import { PrismaModule } from 'prisma/prisma.module';
import { UsersService } from 'src/users/users.service';

@Module({
  imports: [PrismaModule],
  controllers: [RolController],
  providers: [RolsService, UsersService],
})
export class RolsModule { }
