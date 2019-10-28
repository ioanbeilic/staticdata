import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Logger } from 'winston';
import path from 'path';
import { Default } from '../../interfaces/provider/default.interface';

@Injectable()
export class AccommodationsTypesServices {
  constructor(
    @InjectModel('temporal_accommodations_types')
    private readonly hotelDetailsModel: Model<Default>,
    @Inject('winston') private readonly logger: Logger,
  ) {}

  async saveAccommodationsTypes(types: Default[]) {
    try {
      await this.hotelDetailsModel.collection.insertMany(types);
    } catch (error) {
      this.logger.error(
        path.resolve(__filename) + ' ---> ' + JSON.stringify(error),
      );
    }
  }
}
