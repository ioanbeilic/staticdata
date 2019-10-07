import { Module, HttpModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { ConfigService } from './config/config.service';
import { Configuration } from './config/config.keys';
import { AmqpConnection, RabbitMQModule } from '@nestjs-plus/rabbitmq';
import { WorkToMeModule } from './modules/work-to-me/work-to-me.module';
import { BedsOnlineModule } from './modules/beds-online/beds-online.module';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { AbreuModule } from './modules/abreu/abreu.module';
import { CustomLoggerModule } from './custom-logger/custom-logger.module';
import { LoggerModule } from './logger/logger.module';
import { CustomLoggerModule } from './custom-logger/custom-logger.module';

@Module({
  imports: [
    /**
     * Inject configModule and ConfigService to RabbitMqModule
     * exchanges are te que name.
     * type - can use 3 type [direct, topic, fanout ]
     */
    RabbitMQModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        exchanges: [
          {
            name: 'work_to_me_hotels',
            type: 'fanout',
          },
          {
            name: 'work_to_me_hotel-detail',
            type: 'fanout',
          },
          {
            name: 'beds_online_hotels',
            type: 'fanout',
          },
          {
            name: 'bed_online_hotel-detail',
            type: 'fanout',
          },
          {
            name: 'abreu_hotels',
            type: 'fanout',
          },
          {
            name: 'abreu_hotel-detail',
            type: 'fanout',
          },
        ],
        uri: configService.get('RABBITMQ_URI'),
        prefetchCount: 1, // only 1 request each time default 10
      }),
      inject: [ConfigService],
    }),
    /*
    ElasticsearchModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        host: configService.get('ELASTICSEARCH_HOST'),
        log: 'trace',
      }),
      inject: [ConfigService],
    }),
*/
    ConfigModule,
    DatabaseModule,
    HttpModule,
    WorkToMeModule,
    BedsOnlineModule,
    AbreuModule,
    CustomLoggerModule,
    LoggerModule,
  ],
  controllers: [AppController],
  providers: [AppService, AmqpConnection],
  exports: [RabbitMQModule],
})
export class AppModule {
  static port: number | string;

  constructor(private readonly configService: ConfigService) {
    AppModule.port = this.configService.get(Configuration.PORT);
  }
}
