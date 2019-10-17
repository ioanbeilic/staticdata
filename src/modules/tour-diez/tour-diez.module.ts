import { Module } from '@nestjs/common';
import { HotelDetailsController } from './controllers/hotel-details/hotel-details.controller';
import { HotelsController } from './controllers/hotels/hotels.controller';
import { HotelsService } from './services/hotels/hotels.service';
import { HotelDetailsService } from './services/hotel-details/hotel-details.service';
import { RabbitMQModule } from '@nestjs-plus/rabbitmq';
import { ConfigModule } from '../..//config/config.module';
import { ConfigService } from '../../config/config.service';
import { MongooseModule } from '@nestjs/mongoose';
import { WinstonModule } from 'nest-winston';
import { HotelSchema } from './schemas/hotels.chema';
import { HotelContentSchema } from './schemas/hotel-content.schema';
import { RoomSchema } from './schemas/room.schema';

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
      { name: 'tour_diez_hotels', schema: HotelSchema },
      { name: 'tour_diez_hotel-content', schema: HotelContentSchema },
      { name: 'tour_diez_rooms', schema: RoomSchema },
    ]),
    ConfigModule,
    WinstonModule,
  ],
  controllers: [HotelsController, HotelDetailsController],
  providers: [HotelsService, HotelDetailsService],
})
export class TourDiezModule {}
