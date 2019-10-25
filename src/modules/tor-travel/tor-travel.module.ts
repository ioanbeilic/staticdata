import { Module } from '@nestjs/common';
import { HotelDetailsService } from './services/hotel-details/hotel-details.service';
import { HotelDetailsController } from './controllers/hotel-details/hotel-details.controller';
import { RabbitMQModule } from '@nestjs-plus/rabbitmq';
import { ConfigModule } from '../../config/config.module';
import { ConfigService } from '../../config/config.service';
import { MongooseModule } from '@nestjs/mongoose';
import { WinstonModule } from 'nest-winston/dist/winston.module';
import { DownloadService } from './services/download/download.service';
import { HotelDetailsSchema } from './schemas/hotel-details.schema';
import { RoomSchema } from './schemas/room.schema';
import { CreateHotelDetailsAdapter } from './adapters/hotel-details.adapter';
import { AccommodationsAmenitiesSchema } from './schemas/temporal/accommodations-amenities.interface';
import { AccommodationsPicturesSchema } from './schemas/temporal/accommodations-pictures.interface';
import { AccommodationsSchema } from './schemas/temporal/accommodations.interface';
import { CitiesSchema } from './schemas/temporal/cities.interface';
import { DefaultSchema } from './schemas/temporal/default.interface';

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
      { name: 'tor_travel_hotel-details', schema: HotelDetailsSchema },
      { name: 'tor_travel_rooms', schema: RoomSchema },
      // temporal schema
      {
        name: 'tor_travel_provider_accommodations-amenities',
        schema: AccommodationsAmenitiesSchema,
      },
      {
        name: 'tor_travel_provider_accommodations-pictures',
        schema: AccommodationsPicturesSchema,
      },
      {
        name: 'tor_travel_provider_accommodations',
        schema: AccommodationsSchema,
      },
      {
        name: 'tor_travel_provider_accommodations',
        schema: AccommodationsSchema,
      },
      {
        name: 'tor_travel_provider_cities',
        schema: CitiesSchema,
      },
      {
        name: 'tor_travel_provider_accommodations-types',
        schema: DefaultSchema,
      },
      {
        name: 'tor_travel_provider_meal_plans',
        schema: DefaultSchema,
      },
      {
        name: 'tor_travel_provider_rooms',
        schema: DefaultSchema,
      },
    ]),
    ConfigModule,
    WinstonModule,
  ],
  providers: [HotelDetailsService, DownloadService, CreateHotelDetailsAdapter],
  controllers: [HotelDetailsController],
})
export class TorTravelModule {}
