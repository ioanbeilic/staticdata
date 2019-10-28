import { Document } from 'mongoose';

export interface Default extends Document {
  ID: string;
  Name: string;
}
