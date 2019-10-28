import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Accommodations } from '../../interfaces/provider/accommodations.interface';
import { Logger } from 'winston';
import path from 'path';
import { Default } from '../../interfaces/provider/default.interface';

@Injectable()
export class AmenitiesService {
  constructor(
    @InjectModel('temporal_accommodations')
    private readonly hotelDetailsModel: Model<Default>,
    @Inject('winston') private readonly logger: Logger,
  ) {}

  async saveAmenities(amenities: Accommodations[]) {
    try {
      await this.hotelDetailsModel.collection.insertMany(amenities);
    } catch (error) {
      this.logger.error(
        path.resolve(__filename) + ' ---> ' + JSON.stringify(error),
      );
    }
  }
}
