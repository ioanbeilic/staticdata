import { Module } from '@nestjs/common';
import { HotelsController } from './controllers/hotels/hotels.controller';
import { HotelDetailsController } from './controllers/hotel-details/hotel-details.controller';
import { ImagesController } from './controllers/images/images.controller';
import { HotelsService } from './services/hotels/hotels.service';
import { HotelDetailsService } from './services/hotel-details/hotel-details.service';
import { ImagesService } from './services/images/images.service';
import { RabbitMQModule } from '@nestjs-plus/rabbitmq';
import { ConfigModule } from '../../config/config.module';
import { ConfigService } from '../../config/config.service';
import { MongooseModule } from '@nestjs/mongoose';
import { HotelSchema } from './schemas/hotel.schema';
import { HotelDetailsSchema } from './schemas/hotel-details.schema';
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
        exchanges: [
          {
            name: 'beds_online_hotels',
            type: 'fanout',
          },
          {
            name: 'bed_online-detail',
            type: 'fanout',
          },
        ],
        uri: configService.get('RABBITMQ_URI'),
        prefetchCount: 1, // only 1 request each time default 10
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: 'hotels', schema: HotelSchema },
      { name: 'hotelContent', schema: HotelDetailsSchema },
      { name: 'rooms', schema: RoomSchema },
    ]),
  ],
  controllers: [HotelsController, HotelDetailsController, ImagesController],
  providers: [HotelsService, HotelDetailsService, ImagesService],
})
export class BedsOnlineModule {}
