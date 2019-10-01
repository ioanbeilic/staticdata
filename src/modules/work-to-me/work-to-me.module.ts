import { Module } from '@nestjs/common';
import { HotelController } from './controllers/hotel/hotel.controller';
import { RoomsController } from './controllers/rooms/rooms.controller';
import { HotelService } from './services/hotel/hotel.service';
import { RoomsService } from './services/rooms/rooms.service';
import { RabbitMQModule } from '@nestjs-plus/rabbitmq';
import { ConfigModule } from '../../config/config.module';
import { ConfigService } from '../../config/config.service';
import { MongooseModule } from '@nestjs/mongoose';
import { HotelSchema } from './schemas/hotels.chema';
import { HotelContentSchema } from './schemas/hotel-content.schema';
import { RoomSchema } from './schemas/room.schema';
import { HotelDetailsController } from './controllers/hotel-details/hotel-details.controller';
import { HotelDetailsService } from './services/hotel-details/hotel-details.service';

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
            name: 'work-to-me',
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
          {
            name: 'work_to_me_hotels',
            type: 'fanout',
          },
          {
            name: 'work_to_me_hotel-detail',
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
      { name: 'hotelContent', schema: HotelContentSchema },
      { name: 'rooms', schema: RoomSchema },
    ]),
  ],
  controllers: [HotelController, HotelDetailsController, RoomsController],
  providers: [HotelService, HotelDetailsService, RoomsService],
})
export class WorkToMeModule {}
