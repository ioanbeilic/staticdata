import { Module, HttpModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { ConfigService } from './config/config.service';
import { Configuration } from './config/config.keys';
import { AmqpConnection, RabbitMQModule } from '@nestjs-plus/rabbitmq';
import { BedsOnlineModule } from './modules/beds-online/beds-online.module';
import { AbreuModule } from './modules/abreu/abreu.module';
import { WinstonModule } from 'nest-winston';
import { TourDiezModule } from './modules/tour-diez/tour-diez.module';
import { TorTravelModule } from './modules/tor-travel/tor-travel.module';
import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { WorldToMeetModule } from './modules/world-to-meet/world-to-meet.module';

const colorizer = winston.format.colorize();

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
            name: 'word_to_meet_hotels',
            type: 'fanout',
          },
          {
            name: 'word_to_meet_hotel-details',
            type: 'fanout',
          },
          {
            name: 'beds_online_hotels',
            type: 'fanout',
          },
          {
            name: 'beds_online_hotel-details',
            type: 'fanout',
          },
          {
            name: 'abreu_hotels',
            type: 'fanout',
          },
          {
            name: 'abreu_hotel-details',
            type: 'fanout',
          },
          {
            name: 'abreu_country',
            type: 'fanout',
          },
          {
            name: 'tour_diez_hotels',
            type: 'fanout',
          },
          {
            name: 'tour_diez_hotel-details',
            type: 'fanout',
          },
          // tor_travel_hotel-details
          {
            name: 'tor_travel_hotel-details',
            type: 'fanout',
          },
        ],
        uri: configService.get('RABBITMQ_URI'),
        prefetchCount: 1, // only 1 request each time default 10
      }),
      inject: [ConfigService],
    }),

    WinstonModule.forRootAsync({
      useFactory: () => ({
        // options
        transports: [
          //
          // - Write to all logs with level `info` and below to `combined.log`
          // - Write all logs error (and below) to `error.log`.
          //

          new DailyRotateFile({
            dirname: './logs/error/',
            filename: 'error-',
            datePattern: 'YYYY-MM-DD',
            maxSize: '10m',
            maxFiles: '14d',
            level: 'error',
            format: winston.format.combine(
              winston.format.timestamp({ format: 'HH:mm:ss' }),
              winston.format.simple(),
              winston.format.printf(
                msg => `${msg.timestamp} - ${msg.level}: ${msg.message}`,
              ),
            ),
          }),

          new DailyRotateFile({
            dirname: 'logs/info/',
            filename: 'info-',
            datePattern: 'YYYY-MM-DD',
            maxSize: '10m',
            maxFiles: '14d',

            format: winston.format.combine(
              winston.format.timestamp({ format: 'HH:mm:ss' }),
              winston.format.simple(),
              winston.format.printf(
                msg => `${msg.timestamp} - ${msg.level}: ${msg.message}`,
              ),
            ),
          }),
          /*
          new winston.transports.Console({
            level: 'debug',
            handleExceptions: true,
            format: winston.format.combine(
              winston.format.timestamp({ format: 'HH:mm:ss' }),
              winston.format.simple(),
              winston.format.printf(msg =>
                colorizer.colorize(
                  msg.level,
                  `${msg.timestamp} -  ${msg.level}: ${msg.message}`,
                ),
              ),
            ),
          }),
          */
        ],
        exitOnError: false,
      }),
      // future implementation of elastic search
      inject: [],
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
    WorldToMeetModule,
    BedsOnlineModule,
    AbreuModule,
    TourDiezModule,
    TorTravelModule,
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
