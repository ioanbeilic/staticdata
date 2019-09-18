import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  /**
   * prefix for application endpoint
   */
  app.setGlobalPrefix('api');

  /**
   * load start port from AppModule
   * for separate container the configuration of AppModule and this file main.ts must be replicated on every module on module folder
   * config and database are common module for all application
   */
  await app.listen(AppModule.port);
}
bootstrap();
