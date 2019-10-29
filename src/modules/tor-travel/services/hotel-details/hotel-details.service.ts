import { Injectable, Inject } from '@nestjs/common';
import { AmqpConnection } from '@nestjs-plus/rabbitmq';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HotelDetails } from '../../interfaces/hotel-details.interface';
import { ConfigService } from '../../../../config/config.service';
import { Logger } from 'winston';
import path from 'path';
import { Room } from '../../interfaces/room.interface';

@Injectable()
export class HotelDetailsService {
  constructor(
    public readonly amqpConnection: AmqpConnection,
    @InjectModel('tor_travel_hotel-details')
    private readonly hotelDetailsModel: Model<HotelDetails>,
    private readonly configService: ConfigService,
    @Inject('winston') private readonly logger: Logger,
  ) {}

  async saveHotelsDetails(hotelDetails: any) {
    const newHotel = new this.hotelDetailsModel(hotelDetails);

    try {
      await this.hotelDetailsModel.findOneAndUpdate(
        { hotelId: newHotel.hotelId },
        {
          name: newHotel.name,
          description: newHotel.description,
          location: newHotel.location,
          city: newHotel.city,
          address: newHotel.address,
          province: newHotel.province,
          country: newHotel.country,
          postalCode: newHotel.postalCode,
          web: newHotel.web,
          phones: newHotel.phones,
          email: newHotel.email,
          category: newHotel.country,
          photos: newHotel.photos,
          facilities: newHotel.facilities,
          currency: newHotel.currency,
        },
        {
          upsert: true,
          new: true,
        },
      );
    } catch (error) {
      this.logger.error(
        path.resolve(__filename) + ' ---> ' + JSON.stringify(error),
      );
    }
  }
}
