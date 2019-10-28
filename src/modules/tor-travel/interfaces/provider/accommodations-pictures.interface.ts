import { Document } from 'mongoose';

export interface AccommodationsPictures extends Document {
  'Hotel ID': string;
  'Picture path': string;
}
