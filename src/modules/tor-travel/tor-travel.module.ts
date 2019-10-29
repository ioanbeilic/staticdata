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
import { AccommodationsSchema } from './schemas/temporal-data/accommodations.schema';
import { AccommodationsAmenitiesSchema } from './schemas/temporal-data/accommodations-amenities.schema';
import { AccommodationsTypesSchema } from './schemas/temporal-data/accommodations-types.schema';
import { AccommodationsPicturesSchema } from './schemas/temporal-data/accommodations-pictures.schema';
import { AmenitiesSchema } from './schemas/temporal-data/amenities.schema';
import { CitiesSchema } from './schemas/temporal-data/cities.schema';
import { AccommodationsService } from './services/temporal-data/Accommodations.service';
import { AccommodationsAmenitiesServices } from './services/temporal-data/Accommodations_amenities.service';
import { AccommodationsPicturesServices } from './services/temporal-data/Accommodations_pictures.service';
import { AccommodationsTypesServices } from './services/temporal-data/Accommodations_types_ES.service';
import { AmenitiesService } from './services/temporal-data/Amenities_ES.service';
import { CitiesService } from './services/temporal-data/Cities_ES.service';
import { RoomService } from './services/room/room.service';

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
      { name: 'temporal_accommodations', schema: AccommodationsSchema },
      {
        name: 'temporal_accommodations_amenities',
        schema: AccommodationsAmenitiesSchema,
      },
      {
        name: 'temporal_accommodations_pictures',
        schema: AccommodationsPicturesSchema,
      },
      {
        name: 'temporal_accommodations_types',
        schema: AccommodationsTypesSchema,
      },
      {
        name: 'temporal_amenities',
        schema: AmenitiesSchema,
      },
      {
        name: 'temporal_cities',
        schema: CitiesSchema,
      },
      // temporal schema
    ]),
    ConfigModule,
    WinstonModule,
  ],
  providers: [
    HotelDetailsService,
    DownloadService,
    CreateHotelDetailsAdapter,
    AccommodationsService,
    AccommodationsAmenitiesServices,
    AccommodationsPicturesServices,
    AccommodationsTypesServices,
    AmenitiesService,
    CitiesService,
    RoomService,
  ],
  controllers: [HotelDetailsController],
})
export class TorTravelModule {}
