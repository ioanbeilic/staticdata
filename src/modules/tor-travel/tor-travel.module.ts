import { Module } from '@nestjs/common';
import { HotelsService } from './services/hotels/hotels.service';
import { HotelDetailsService } from './services/hotel-details/hotel-details.service';
import { HotelDetailsController } from './controllers/hotel-details/hotel-details.controller';
import { HotelsController } from './controllers/hotels/hotels.controller';
import { RabbitMQModule } from '@nestjs-plus/rabbitmq';
import { ConfigModule } from '../../config/config.module';
import { ConfigService } from '../../config/config.service';
import { MongooseModule } from '@nestjs/mongoose';
import { WinstonModule } from 'nest-winston/dist/winston.module';

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
      //  { name: 'tour_diez_hotels', schema: HotelSchema },
      //  { name: 'tour_diez_hotel-details', schema: HotelDetailsSchema },
      //  { name: 'tour_diez_rooms', schema: RoomSchema },
    ]),
    ConfigModule,
    WinstonModule,
  ],
  providers: [HotelsService, HotelDetailsService],
  controllers: [HotelDetailsController, HotelsController],
})
export class TorTravelModule {}
