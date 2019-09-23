import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  /**
   * prefix for application endpoint
   */
  // app.setGlobalPrefix('api');

  const options = new DocumentBuilder()
    .setTitle('Static Data Api')
    .setDescription('Static data for all hotels')
    .setVersion('1.0')
    .addTag('hotels')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);

  /**
   * load start port from AppModule
   * for separate container the configuration of AppModule and this file main.ts must be replicated on every module on module folder
   * config and database are common module for all application
   */
  await app.listen(AppModule.port);
}
bootstrap();
