import { Module, HttpModule } from '@nestjs/common';
import { RabbitMQModule } from '@nestjs-plus/rabbitmq';
import { ConfigModule } from '../../config/config.module';
import { ConfigService } from '../../config/config.service';
import { RabbitMqService } from './services/rabbit-mq/rabbit-mq.service';
import { RabbitMqController } from './controllers/rabbit-mq/rabbit-mq.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { WorkToMeSchema } from './schemas/work-to-me.chema';
import { WorkToMeService } from './services/work-to-me/work-to-me.service';

@Module({
  imports: [
    /**
     * Mongoose for feature - make disposable to this module mongo connection
     * accept as parameter an array of schemas
     * name  field on schema object is optional
     */
    MongooseModule.forFeature([{ name: 'work_to_me', schema: WorkToMeSchema }]),
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
        ],
        uri: configService.get('RABBITMQ_URI'),
      }),
      inject: [ConfigService],
    }),

    HttpModule,
  ],
  providers: [RabbitMqService, WorkToMeService],
  controllers: [RabbitMqController],
})
export class RabbitMqModule {}
