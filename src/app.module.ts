import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { PrinterModule } from './metropolis/printer/printer.module';
import { PdfSigningService } from './metropolis/pdf-signing/pdf-signing.service';
import { PdfSigningController } from './metropolis/pdf-signing/pdf-signing.controller';
import { FacturaModule } from './metropolis/factura/factura.module';
import { MulterModule } from '@nestjs/platform-express';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PdfSigningModule } from './metropolis/pdf-signing/pdf-signing.module';


@Module({
  imports: [
    MulterModule.register({
      dest: './uploads', // Directorio donde se guardarán los archivos temporalmente
      }),
    ConfigModule.forRoot({ isGlobal:true }), //Esto configura para que las variables de entorno esten disponibles para cualquier parte del codigo
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/public',
     }), // Opcional: para acceder a través de '/public/output' }),
    AuthModule,
    UsersModule,
    PrinterModule,
    FacturaModule,
    PdfSigningModule

  ],
  controllers: [AppController, PdfSigningController],
  providers: [AppService, PdfSigningService],
})
export class AppModule {}
