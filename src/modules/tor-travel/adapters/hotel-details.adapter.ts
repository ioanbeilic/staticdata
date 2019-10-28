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
    private readonly hotelDetailsService: HotelDetailsService,
    private readonly accommodationsService: AccommodationsService,
    private readonly accommodationsAmenitiesServices: AccommodationsAmenitiesServices,
    private readonly accommodationsPicturesServices: AccommodationsPicturesServices,
    private readonly accommodationsTypesServices: AccommodationsTypesServices,
    private readonly amenitiesService: AmenitiesService,
    private readonly citiesService: CitiesService,
  ) {}

  async transform() {
    await csv()
      .fromFile('./tor-travel-files/csv/Accommodations_ES.csv')
      .preFileLine((fileLineString, lineIdx) => {
        return new Promise(async (resolve, reject) => {
          if (lineIdx > 0) {
            try {
              await csv({
                noheader: true,
                delimiter: '|',
                quote: '"',
                trim: true,
                headers: [
                  'ID',
                  'Name',
                  'Address',
                  'Zip',
                  'Giata',
                  'City ID',
                  'Phone',
                  'Fax',
                  'Category',
                  'Accommodation Type ID',
                  'Latitude',
                  'Longitude',
                  'Status',
                  'Description',
                ],
              })
                .fromString(fileLineString)
                .subscribe(async (hotel: Accommodations) => {});
              resolve();
            } catch (error) {
              resolve();
            }
          } else {
            resolve();
          }
        });
      });
  }
}
