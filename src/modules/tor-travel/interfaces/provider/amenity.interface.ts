import { Document } from 'mongoose';

export interface Amenity extends Document {
  amenityId: string;
  name: string;
}
