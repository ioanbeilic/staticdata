import { Module } from '@nestjs/common';
import { RabbitMQModule } from '@nestjs-plus/rabbitmq';
import { ConfigModule } from '../../config/config.module';
import { ConfigService } from '../../config/config.service';
import { MongooseModule } from '@nestjs/mongoose';
import { HotelService } from './services/hotel/hotel.service';
import { HotelDetailsService } from './services/hotel-details/hotel-details.service';
import { HotelDetailsController } from './controllers/hotel-details/hotel-details.controller';
import { HotelController } from './controllers/hotel/hotel.controller';
import { HotelSchema } from './schemas/hotels.chema';
import { HotelContentSchema } from './schemas/hotel-content.schema';
import { WinstonModule } from 'nest-winston';
import { CreateHotelAdapter } from './adapters/hotel.adapter';
import { CreateHotelDetailsAdapter } from './adapters/hotel-details.adapter';

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
        uri: configService.get('RABBITMQ_URI'),
        prefetchCount: 1, // only 1 request each time default 10
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: 'abreu_hotels', schema: HotelSchema },
      { name: 'abreu_hotel-details', schema: HotelContentSchema },
    ]),
    ConfigModule,
    WinstonModule,
  ],
  providers: [
    HotelService,
    HotelDetailsService,
    CreateHotelAdapter,
    CreateHotelDetailsAdapter,
  ],
  controllers: [HotelDetailsController, HotelController],
})
export class AbreuModule {}
