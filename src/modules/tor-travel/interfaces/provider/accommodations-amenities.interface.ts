import { Document } from 'mongoose';

export interface AccommodationsAmenities extends Document {
  hotelId: string;
  amenityId: string;
}
