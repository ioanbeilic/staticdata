import { Document } from 'mongoose';

export interface Hotel extends Document {
  jPCode: string;
  hasSynonyms: boolean;
  name: string;
  zone: string;
  address: string;
  zipCode: number;
  latitude: number;
  longitude: number;
  hotelCategory: string;
  city: string;
}
