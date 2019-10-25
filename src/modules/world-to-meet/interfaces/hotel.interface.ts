import { Document } from 'mongoose';

export interface Hotel extends Document {
  hotelId: string;
  name: string;
  zone: string;
  address: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  hotelCategory: string;
  city: string;
}
