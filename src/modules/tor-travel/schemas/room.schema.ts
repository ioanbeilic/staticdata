import { Schema } from 'mongoose';

export const RoomSchema = new Schema({
  hotelId: String,
  name: String,
});
