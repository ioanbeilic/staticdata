import t from 'typy';
import { Inject, Injectable } from '@nestjs/common';
import { Logger } from 'winston';
import path from 'path';
import _ from 'lodash';
import { CreateHotelDetailsDto } from '../dto/create-hotel-details.dto';
import { Accommodations } from '../interfaces/provider/accommodations.interface';
import { AccommodationsAmenities } from '../interfaces/provider/accommodations-amenities.interface';
import { AccommodationsPictures } from '../interfaces/provider/accommodations-pictures.interface';
import { Default } from '../interfaces/provider/default.interface';
import { Cities } from '../interfaces/provider/cities.interface';
import { HotelDetailsService } from '../services/hotel-details/hotel-details.service';
import { HotelDetails } from '../interfaces/hotel-details.interface';
import readline from 'readline';
import fs from 'fs';
import csv from 'csvtojson';

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
  ) {}

  async transform() {
    const test = await csv()
      .fromFile('./tor-travel-files/csv/Accommodations_ES.csv')
      .preFileLine((fileLineString, lineIdx) => {
        return new Promise(async (resolve, reject) => {
          if (lineIdx > 0) {
            return await csv({
              noheader: false,
              delimiter: '|',
              quote: '"',
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
              .subscribe(data => data);
          }

          resolve();
        });
      });

    //  console.log(test);
  }
}
