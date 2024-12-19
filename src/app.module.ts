import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { MetropolisModule } from './metropolis/metropolis.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal:true }), //Esto configura para que las variables de entorno esten disponibles para cualquier parte del codigo
    AuthModule,
    MetropolisModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
