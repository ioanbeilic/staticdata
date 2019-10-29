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
    private readonly cityProviderModel: Model<CityProvider>,
    @Inject('winston') private readonly logger: Logger,
  ) {}

  async saveCities(cities: CityProvider[]) {
    try {
      await this.cityProviderModel.collection.insert(cities);
    } catch (error) {
      this.logger.error(
        path.resolve(__filename) + ' ---> ' + JSON.stringify(error),
      );
    }
  }

  async getCities() {
    return this.cityProviderModel.find();
  }

  async getCityByHotelId(cityId: string) {
    return this.cityProviderModel.findOne({ cityId });
  }

  async deleteCityByHotelId(cityId: string) {
    return this.cityProviderModel.deleteMany({ cityId });
  }
}
