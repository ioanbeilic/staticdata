import { Schema } from 'mongoose';

export const HotelSchema = new Schema({
  hotelId: String,
  name: String,
  zone: String,
  address: String,
  zipCode: String,
  latitude: Number,
  longitude: Number,
  hotelCategory: String,
  city: String,
});
