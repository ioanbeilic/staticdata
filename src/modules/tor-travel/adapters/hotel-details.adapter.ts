import { Inject, Injectable } from '@nestjs/common';
import { Logger } from 'winston';
import path from 'path';
import _ from 'lodash';
import { Accommodations } from '../interfaces/provider/accommodations.interface';
import { HotelDetailsService } from '../services/hotel-details/hotel-details.service';
import csv from 'csvtojson';
import { AccommodationsService } from '../services/temporal-data/Accommodations.service';
import { AccommodationsAmenitiesServices } from '../services/temporal-data/Accommodations_amenities.service';
import { AccommodationsPicturesServices } from '../services/temporal-data/Accommodations_pictures.service';
import { AccommodationsTypesServices } from '../services/temporal-data/Accommodations_types_ES.service';
import { AmenitiesService } from '../services/temporal-data/Amenities_ES.service';
import { CitiesService } from '../services/temporal-data/Cities_ES.service';
import { AmqpConnection, RabbitSubscribe } from '@nestjs-plus/rabbitmq';
import { CreateHotelDetailsDto } from '../dto/create-hotel-details.dto';
import { AccommodationsAmenities } from '../interfaces/provider/accommodations-amenities.interface';
import { CityProvider } from '../interfaces/provider/cities.interface';

@Injectable()
export class CreateHotelDetailsAdapter {
  // accommodations_amenities: AccommodationsAmenities[],
  // accommodations: Accommodations[],
  // accommodations_pictures: AccommodationsPictures[],
  // accommodations_types: Default[],
  // amenities: Default[],
  // cities: Cities[],
  // meal_plans: Default[],
  // rooms: Default[],

  constructor(
    @Inject('winston') private readonly logger: Logger,
    public readonly amqpConnection: AmqpConnection,
    private readonly hotelDetailsService: HotelDetailsService,
    private readonly accommodationsService: AccommodationsService,
    private readonly accommodationsAmenitiesServices: AccommodationsAmenitiesServices,
    private readonly accommodationsPicturesServices: AccommodationsPicturesServices,
    private readonly accommodationsTypesServices: AccommodationsTypesServices,
    private readonly amenitiesService: AmenitiesService,
    private readonly citiesService: CitiesService,
  ) {}

  async publish() {
    const hotels: Accommodations[] = await this.accommodationsService.getAccommodations();

    for (const hotel of hotels) {
      this.amqpConnection.publish(
        'tor_travel_hotel-details',
        'tor_travel_hotel-details',
        hotel.hotelId,
      );
    }
  }

  @RabbitSubscribe({
    exchange: 'tor_travel_hotel-details',
    routingKey: 'tor_travel_hotel-details',
    queue: 'tor_travel_hotel-details',
  })
  async transform(hotelId: string) {
    const accommodationsAmenities: AccommodationsAmenities[] = await this.accommodationsAmenitiesServices.getAmenitiesByHotelId(
      hotelId,
    );

    const hotel: Accommodations | null = await this.accommodationsService.getAccommodationsByHotelId(
      hotelId,
    );

    const pictures = await this.accommodationsPicturesServices.getPicturesByHotelId(
      hotelId,
    );

    let amenities: any = [];

    for (const amenity of accommodationsAmenities) {
      const newAmelity = await this.amenitiesService.getAmenitiesById(
        amenity.amenityId,
      );

      if (newAmelity) {
        amenities.push(newAmelity);
      }
    }
    let city: CityProvider | null;
    if (hotel) {
      city = await this.citiesService.getCityByHotelId(hotel.cityId);

      const hotelDetails = new CreateHotelDetailsDto();
      try {
        hotelDetails.hotelId = hotel.hotelId ? hotel.hotelId : '';
        hotelDetails.name = hotel.name ? hotel.name : '';
        hotelDetails.address = hotel.address ? hotel.address : '';
        hotelDetails.description = hotel.description ? hotel.description : '';
        hotelDetails.postalCode = hotel.postalCode ? hotel.postalCode : '';
        hotelDetails.location = {
          latitude: hotel.latitude ? hotel.latitude : '',
          longitude: hotel.longitude ? hotel.longitude : '',
        };

        if (city) {
          hotelDetails.city = city.name ? city.name : '';
          hotelDetails.province = city.province ? city.province : '';
          hotelDetails.country = city.country ? city.country : '';
          hotelDetails.web = '';
        }

        hotelDetails.phones = [
          {
            number: hotel.phone,
            info: 'phone',
          },
          {
            number: hotel.fax,
            info: 'fax',
          },
        ];

        hotelDetails.email = '';
        hotelDetails.category = {
          name: hotel.category,
          value: hotel.category,
        };

        hotelDetails.photos = [];

        for (const picture of pictures) {
          const newPhoto = {
            info: '',
            fileName: picture.path,
            title: '',
          };

          hotelDetails.photos.push(newPhoto);
        }

        hotelDetails.facilities = [];
        for (const amenity of amenities) {
          const newFacility = {
            id: amenity.amenityId,
            description: amenity.name,
            groupId: '',
          };

          hotelDetails.facilities.push(newFacility);
        }

        hotelDetails.currency = '';

        await this.hotelDetailsService.saveHotelsDetails(hotelDetails);
        await this.accommodationsAmenitiesServices.deleteAmenitiesByHotelId(
          hotelId,
        );
        await this.accommodationsService.deleteAccommodationsByHotelId(hotelId);
        await this.accommodationsPicturesServices.deletePicturesByHotelId(
          hotelId,
        );

        for (const amenity of accommodationsAmenities) {
          amenities = await this.amenitiesService.deleteAmenitiesById(
            amenity.amenityId,
          );
        }
        await this.citiesService.deleteCityByHotelId(hotelId);
      } catch (error) {
        this.logger.error(
          path.resolve(__filename) + ' ---> ' + `${hotelDetails.hotelId}`,
        );
      }
    }
  }
}
