import { Document } from 'mongoose';

export interface AccommodationsPictures extends Document {
  hotelId: string;
  path: string;
}
