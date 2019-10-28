import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Accommodations } from '../../interfaces/provider/accommodations.interface';
import { Logger } from 'winston';
import path from 'path';

@Injectable()
export class AccommodationsService {
  constructor(
    @InjectModel('temporal_accommodations')
    private readonly hotelDetailsModel: Model<Accommodations>,
    @Inject('winston') private readonly logger: Logger,
  ) {}

  async saveAccommodations(accommodations: Accommodations[]) {
    try {
      await this.hotelDetailsModel.collection.insertMany(accommodations);
    } catch (error) {
      this.logger.error(
        path.resolve(__filename) + ' ---> ' + JSON.stringify(error),
      );
    }
  }
}
