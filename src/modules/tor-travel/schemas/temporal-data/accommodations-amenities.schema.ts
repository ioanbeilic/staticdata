import { Schema } from 'mongoose';

export const AccommodationsAmenitiesSchema = new Schema({
  hotelId: String,
  amenityId: String,
});
