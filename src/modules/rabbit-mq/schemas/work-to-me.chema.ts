import { Schema } from 'mongoose';

export const Hotel = new Schema({
  jPCode: String,
  hasSynonyms: Boolean,
  name: String,
  zone: String,
  address: String,
  zipCode: Number,
  latitude: Number,
  longitude: Number,
  hotelCategory: String,
  city: String,
});
