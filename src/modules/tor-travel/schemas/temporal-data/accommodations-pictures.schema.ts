import { Schema } from 'mongoose';

export const AccommodationsPicturesSchema = new Schema({
  hotelId: String,
  path: String,
});
