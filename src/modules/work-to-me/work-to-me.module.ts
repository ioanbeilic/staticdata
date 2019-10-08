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
import { WinstonModule } from 'nest-winston';

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
      { name: 'work_to_me_hotels', schema: HotelSchema },
      { name: 'work_to_me_hotel-content', schema: HotelContentSchema },
      { name: 'work_to_me_rooms', schema: RoomSchema },
    ]),
    ConfigModule,
    WinstonModule,
  ],
  controllers: [HotelController, HotelDetailsController, RoomsController],
  providers: [HotelService, HotelDetailsService, RoomsService],
})
export class WorkToMeModule {}
