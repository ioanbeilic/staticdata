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
    private readonly accommodationsModel: Model<Accommodations>,
    @Inject('winston') private readonly logger: Logger,
  ) {}

  async saveAccommodations(accommodations: Accommodations[]) {
    try {
      await this.accommodationsModel.collection.insertMany(accommodations);
    } catch (error) {
      this.logger.error(
        path.resolve(__filename) + ' ---> ' + JSON.stringify(error),
      );
    }
  }

  async getAccommodations() {
    return this.accommodationsModel.find().select('hotelId');
  }

  async getAccommodationsByHotelId(hotelId: string) {
    return this.accommodationsModel.findOne({ hotelId });
  }

  async deleteAccommodationsByHotelId(hotelId: string) {
    return this.accommodationsModel.deleteMany({ hotelId });
  }
}
