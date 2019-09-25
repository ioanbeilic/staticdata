import { Module, HttpModule } from '@nestjs/common';
import { RabbitMQModule, AmqpConnection } from '@nestjs-plus/rabbitmq';
import { ConfigModule } from '../../config/config.module';
import { ConfigService } from '../../config/config.service';
import { RabbitMqService } from './services/rabbit-mq/rabbit-mq.service';
import { RabbitMqController } from './controllers/rabbit-mq/rabbit-mq.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { HotelSchema } from './schemas/hotelschema';
import { WorkToMeService } from './services/work-to-me/work-to-me.service';
import { WorkToMeController } from './controllers/wotk-to-me/work-to-me.controller';

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
            name: 'exchange1',
            type: 'topic',
          },
          {
            name: 'exchange2',
            type: 'fanout',
          },
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
    MongooseModule.forFeature([{ name: 'hotels', schema: HotelSchema }]),
    // library import
    HttpModule,
  ],
  controllers: [RabbitMqController, WorkToMeController],
  providers: [RabbitMqService, WorkToMeService],
})
export class RabbitMqModule {}
