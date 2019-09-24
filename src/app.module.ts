import { Module, HttpModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { ConfigService } from './config/config.service';
import { Configuration } from './config/config.keys';
import { AmqpConnection } from '@nestjs-plus/rabbitmq';
import { RabbitMqModule } from './modules/rabbit-mq/rabbit-mq.module';
import { WorkToMeService } from './modules/rabbit-mq/services/work-to-me/work-to-me.service';

@Module({
  imports: [ConfigModule, DatabaseModule, RabbitMqModule, HttpModule],
  controllers: [AppController],
  providers: [AppService, AmqpConnection, WorkToMeService],
})
export class AppModule {
  static port: number | string;

  constructor(private readonly configService: ConfigService) {
    AppModule.port = this.configService.get(Configuration.PORT);
  }
}
