import { Module, HttpModule } from '@nestjs/common';
import { RabbitMQModule, AmqpConnection } from '@nestjs-plus/rabbitmq';
import { ConfigModule } from '../../config/config.module';
import { ConfigService } from '../../config/config.service';
import { RabbitMqService } from './services/rabbit-mq/rabbit-mq.service';
import { MongooseModule } from '@nestjs/mongoose';
import { HotelSchema } from './schemas/work-to-me/hotels.chema';
import { HotelService } from './services/work-to-me/hotel.service';
import { WorkToMeController } from './controllers/wotk-to-me/work-to-me.controller';
import { HotelContentService } from './services/work-to-me/hotel-content.service';
import { HotelContentSchema } from './schemas/work-to-me/hotel-content.schema';

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
            name: 'workToMe',
            type: 'fanout',
            /*
            options: {
              durable?: boolean;
              internal?: boolean;
              autoDelete?: boolean;
              alternateExchange?: string;
            }
            */
          },
        ],
        uri: configService.get('RABBITMQ_URI'),
        prefetchCount: 1, // only 1 request each time default 10
      }),
      inject: [ConfigService],
    }),
    /**
     * Mongoose for feature - make disposable to this module mongo connection
     * accept as parameter an array of schemas
     * name  field on schema object is optional
     */
    MongooseModule.forFeature([
      { name: 'hotels', schema: HotelSchema },
      { name: 'hotelContent', schema: HotelContentSchema },
    ]),
    // library import
    HttpModule,
  ],
  controllers: [WorkToMeController],
  providers: [RabbitMqService, HotelContentService, HotelService],
})
export class RabbitMqModule {}
