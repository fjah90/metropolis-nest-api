import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { config } from 'dotenv';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express'; // Importa NestExpressApplication
import { join } from 'path'; // Para manejar rutas de archivos

config();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule); // Usa NestExpressApplication
  app.setGlobalPrefix('api/v1');

  // Habilitar validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Ignora propiedades no definidas en el DTO
      forbidNonWhitelisted: true, // Lanza un error si hay propiedades no permitidas
      transform: true, // Transforma automáticamente los tipos de datos según el DTO
    }),
  );

  // Configuración de Swagger
  const configSwagger = new DocumentBuilder()
    .addBearerAuth()
    .setTitle('metropolis-api')
    .setDescription('')
    .setVersion('1.0')
    .addTag('api')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, configSwagger);
  SwaggerModule.setup('api/swagger', app, documentFactory);

  // Liberar la carpeta public para acceso desde el navegador
  app.useStaticAssets(join(__dirname, '..', 'public'), {
    prefix: '/public/', // Ruta bajo la cual se servirán los archivos
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();