import { Document } from 'mongoose';

export interface Room extends Document {
  // room interface
  hotelId: string;
  name: string;
}
