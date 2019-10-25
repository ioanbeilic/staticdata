import { Injectable, Inject } from '@nestjs/common';
import { AmqpConnection } from '@nestjs-plus/rabbitmq';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HotelDetails } from '../../interfaces/hotel-details.interface';
import { ConfigService } from '../../../../config/config.service';
import { Logger } from 'winston';

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
          /**
           * if is not exist create new one
           */
          upsert: true,
          new: true,
        },
      );
    } catch (error) {
      //  console.log(error);
    }
  }
}
