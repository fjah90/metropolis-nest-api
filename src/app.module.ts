import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { MetropolisModule } from './metropolis/metropolis.module';
import { UsersModule } from './users/users.module';
import { ReportsModule } from './reports/reports.module';
import { PrinterModule } from './printer/printer.module';
import { PdfSigningService } from './pdf-signing/pdf-signing.service';
import { PdfSigningController } from './pdf-signing/pdf-signing.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal:true }), //Esto configura para que las variables de entorno esten disponibles para cualquier parte del codigo
    AuthModule,
    MetropolisModule,
    UsersModule,
    ReportsModule,
    PrinterModule,
  ],
  controllers: [AppController, PdfSigningController],
  providers: [AppService, PdfSigningService],
})
export class AppModule {}
