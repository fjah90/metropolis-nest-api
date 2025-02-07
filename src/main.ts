import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { config } from 'dotenv';
import { ValidationPipe } from '@nestjs/common';
config();


async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');
  // Habilitar validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Ignora propiedades no definidas en el DTO
      forbidNonWhitelisted: true, // Lanza un error si hay propiedades no permitidas
      transform: true, // Transforma automáticamente los tipos de datos según el DTO
    }),
  );


  const config = new DocumentBuilder()
    .addBearerAuth()
    .setTitle('metropolis-api')
    .setDescription('')
    .setVersion('1.0')
    .addTag('api')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/swagger', app, documentFactory)

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
