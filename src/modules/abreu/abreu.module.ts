import { Module } from '@nestjs/common';
import { RabbitMQModule } from '@nestjs-plus/rabbitmq';
import { ConfigModule } from '../../config/config.module';
import { ConfigService } from '../../config/config.service';
import { MongooseModule } from '@nestjs/mongoose';
import { HotelService } from './services/hotel/hotel.service';
import { HotelDetailsService } from './services/hotel-details/hotel-details.service';
import { HotelDetailsController } from './controllers/hotel-details/hotel-details.controller';
import { HotelController } from './controllers/hotel/hotel.controller';

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
      //  { name: 'abreu_hotels', schema: HotelSchema },
      //  { name: 'abreu_hotel-details', schema: HotelContentSchema },
      //  { name: 'work_to_me_rooms', schema: RoomSchema },
    ]),
    ConfigModule,
  ],
  providers: [HotelService, HotelDetailsService],
  controllers: [HotelDetailsController, HotelController],
})
export class AbreuModule {}
