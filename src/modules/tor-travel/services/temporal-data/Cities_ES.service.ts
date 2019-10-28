import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Logger } from 'winston';
import path from 'path';
import { CityProvider } from '../../interfaces/provider/cities.interface';

@Injectable()
export class CitiesService {
  constructor(
    @InjectModel('temporal_cities')
    private readonly hotelDetailsModel: Model<CityProvider>,
    @Inject('winston') private readonly logger: Logger,
  ) {}

  async saveCities(amenities: CityProvider[]) {
    try {
      await this.hotelDetailsModel.collection.insertMany(amenities);
    } catch (error) {
      this.logger.error(
        path.resolve(__filename) + ' ---> ' + JSON.stringify(error),
      );
    }
  }
}
