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
import { CreateHotelDto } from './dto/create-hotel.dto';
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
      { name: 'beds_on_line_hotels', schema: HotelSchema },
      { name: 'beds_on_line_hotel-details', schema: HotelDetailsSchema },
      { name: 'beds_on_line_rooms', schema: RoomSchema },
    ]),
    ConfigModule,
    CreateHotelDto,
  ],
  controllers: [HotelsController, HotelDetailsController, ImagesController],
  providers: [
    HotelsService,
    HotelDetailsService,
    ImagesService,
    CreateHotelAdapter,
    CreateHotelDetailsAdapter,
  ],
})
export class BedsOnlineModule {}
