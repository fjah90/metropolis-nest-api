import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { config } from 'dotenv';
config();


async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('v1');

  const config = new DocumentBuilder()
  .setTitle('metropolis-api')
  .setDescription('')
  .setVersion('1.0')
  .addTag('api')
  .build();
  
  const documentFactory = () => SwaggerModule.createDocument(app,  config);
  SwaggerModule.setup('api', app, documentFactory)
  
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
