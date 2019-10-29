import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Logger } from 'winston';
import path from 'path';
import { AccommodationsAmenities } from '../../interfaces/provider/accommodations-amenities.interface';

@Injectable()
export class AccommodationsAmenitiesServices {
  constructor(
    @InjectModel('temporal_accommodations_amenities')
    private readonly accommodationsAmenitiesModel: Model<
      AccommodationsAmenities
    >,
    @Inject('winston') private readonly logger: Logger,
  ) {}

  async saveAccommodationsAmenities(
    accommodationsAmenities: AccommodationsAmenities[],
  ) {
    try {
      await this.accommodationsAmenitiesModel.collection.insertMany(
        accommodationsAmenities,
      );
    } catch (error) {
      this.logger.error(
        path.resolve(__filename) + ' ---> ' + JSON.stringify(error),
      );
    }
  }

  async getAmenities() {
    return this.accommodationsAmenitiesModel.find();
  }

  async getAmenitiesByHotelId(hotelId: string) {
    return this.accommodationsAmenitiesModel.find({ hotelId });
  }

  async deleteAmenitiesByHotelId(hotelId: string) {
    return this.accommodationsAmenitiesModel.deleteMany({ hotelId });
  }
}
