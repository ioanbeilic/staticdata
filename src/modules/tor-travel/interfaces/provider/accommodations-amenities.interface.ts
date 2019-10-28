import { Document } from 'mongoose';

export interface AccommodationsAmenities extends Document {
  'ID Hotel': string;
  'ID Amenit': string;
}
