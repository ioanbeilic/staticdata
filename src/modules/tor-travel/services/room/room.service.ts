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
export class RoomService {
  constructor(
    public readonly amqpConnection: AmqpConnection,
    @InjectModel('tor_travel_rooms')
    private readonly RoomModel: Model<Room>,
    private readonly configService: ConfigService,
    @Inject('winston') private readonly logger: Logger,
  ) {}

  async saveRooms(rooms: Room[]) {
    for (const room of rooms) {
      const newRoom = new this.RoomModel(room);

      try {
        await this.RoomModel.findOneAndUpdate(
          { hotelId: newRoom.hotelId },
          {
            name: newRoom.name,
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
}
