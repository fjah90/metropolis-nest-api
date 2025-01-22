import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { PrinterModule } from './metropolis/printer/printer.module';
import { BillModule } from './metropolis/bill/bill.module';
import { MulterModule } from '@nestjs/platform-express';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PdfSigningModule } from './metropolis/pdf-signing/pdf-signing.module';
import { BillStorageModule } from './metropolis/bill-storage/bill-storage.module';

@Module({
  imports: [
    MulterModule.register({
      dest: './uploads', // Directorio donde se guardarán los archivos temporalmente
    }),
    ConfigModule.forRoot({ isGlobal: true }), //Esto configura para que las variables de entorno esten disponibles para cualquier parte del codigo
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/public',
    }), // Opcional: para acceder a través de '/public/output' }),
    AuthModule,
    UsersModule,
    PrinterModule,
    PdfSigningModule,
    BillModule,
    BillStorageModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
