import { Module, HttpModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { ConfigService } from './config/config.service';
import { Configuration } from './config/config.keys';
import { AmqpConnection } from '@nestjs-plus/rabbitmq';
import { RabbitMqModule } from './modules/rabbit-mq/rabbit-mq.module';
import { WorkToMeModule } from './modules/work-to-me/work-to-me.module';
import { BedsOnlineModule } from './modules/beds-online/beds-online.module';
import { HotelsController } from './modules/controllers/hotels/hotels.controller';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    HttpModule,
    WorkToMeModule,
    BedsOnlineModule,
  ],
  controllers: [AppController, HotelsController],
  providers: [AppService, AmqpConnection],
})
export class AppModule {
  static port: number | string;

  constructor(private readonly configService: ConfigService) {
    AppModule.port = this.configService.get(Configuration.PORT);
  }
}
