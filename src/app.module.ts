import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { PrinterModule } from './metropolis/printer/printer.module';
import { PdfSigningService } from './metropolis/pdf-signing/pdf-signing.service';
import { PdfSigningController } from './metropolis/pdf-signing/pdf-signing.controller';
import { FacturaModule } from './factura/factura.module';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    MulterModule.register({
      dest: './uploads', // Directorio donde se guardarán los archivos temporalmente
    }),
    ConfigModule.forRoot({ isGlobal:true }), //Esto configura para que las variables de entorno esten disponibles para cualquier parte del codigo
    AuthModule,
    UsersModule,
    PrinterModule,
    FacturaModule,
  ],
  controllers: [AppController, PdfSigningController],
  providers: [AppService, PdfSigningService],
})
export class AppModule {}
