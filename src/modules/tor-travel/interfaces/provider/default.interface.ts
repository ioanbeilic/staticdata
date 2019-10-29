import { Document } from 'mongoose';

export interface Default extends Document {
  hotelId: string;
  name: string;
}
