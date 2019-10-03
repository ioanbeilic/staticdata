import { Schema } from 'mongoose';

export const HotelDetailsSchema = new Schema({
  hotelId: String,
  name: String,
  description: String,
  location: {
    latitude: String,
    longitude: String,
  },
  city: String,
  address: String,
  province: String,
  country: String,
  postalCode: String,
  web: String,
  phones: [String],
  email: String,
  category: {
    name: String,
    value: String,
  },
  photos: [
    {
      type: String,
      fileName: String,
      title: String,
    },
  ],
  facilities: [
    {
      id: Number,
      description: String,
      groupId: Number,
    },
  ],
  currency: String,
});
