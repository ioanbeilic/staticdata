import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Accommodations } from '../../interfaces/provider/accommodations.interface';
import { Logger } from 'winston';
import path from 'path';
import { Default } from '../../interfaces/provider/default.interface';
import { Amenity } from '../../interfaces/provider/amenity.interface';

@Injectable()
export class AmenitiesService {
  constructor(
    @InjectModel('temporal_amenities')
    private readonly amenitiesModel: Model<Default>,
    @Inject('winston') private readonly logger: Logger,
  ) {}

  async saveAmenities(amenities: Amenity[]) {
    try {
      await this.amenitiesModel.collection.insertMany(amenities);
    } catch (error) {
      this.logger.error(
        path.resolve(__filename) + ' ---> ' + JSON.stringify(error),
      );
    }
  }

  async getAmenities() {
    return this.amenitiesModel.find();
  }

  async getAmenitiesById(amenityId: string) {
    return this.amenitiesModel.findOne({ amenityId });
  }

  async deleteAmenitiesById(amenityId: string) {
    return this.amenitiesModel.deleteMany({ amenityId });
  }
}
