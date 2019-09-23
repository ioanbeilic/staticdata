import { Module, HttpModule } from '@nestjs/common';
import { RabbitMQModule } from '@nestjs-plus/rabbitmq';
import { ConfigModule } from '../../config/config.module';
import { ConfigService } from '../../config/config.service';
import { RabbitMqService } from './services/rabbit-mq/rabbit-mq.service';
import { RabbitMqController } from './controllers/rabbit-mq/rabbit-mq.controller';

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
        ],
        uri: configService.get('RABBITMQ_URI'),
      }),
      inject: [ConfigService],
    }),

    HttpModule,
  ],
  providers: [RabbitMqService],
  controllers: [RabbitMqController],
})
export class RabbitMqModule {}
