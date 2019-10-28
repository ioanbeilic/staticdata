import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Logger } from 'winston';
import path from 'path';
import { AccommodationsPictures } from '../../interfaces/provider/accommodations-pictures.interface';

@Injectable()
export class AccommodationsPicturesServices {
  constructor(
    @InjectModel('temporal_accommodations_pictures')
    private readonly hotelDetailsModel: Model<AccommodationsPictures>,
    @Inject('winston') private readonly logger: Logger,
  ) {}

  async saveAccommodationsPictures(pictures: AccommodationsPictures[]) {
    try {
      await this.hotelDetailsModel.collection.insertMany(pictures);
    } catch (error) {
      this.logger.error(
        path.resolve(__filename) + ' ---> ' + JSON.stringify(error),
      );
    }
  }
}
