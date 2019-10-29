import { Schema } from 'mongoose';

export const AmenitiesSchema = new Schema({
  amenityId: String,
  name: String,
});
