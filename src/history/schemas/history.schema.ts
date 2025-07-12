import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type HistoryDocument = History & Document;

@Schema({
  collection: 'histories',
  timestamps: true,
})
export class History {
  @Prop({ required: true })
  status: string;

  @Prop()
  description?: string;
}

export const HistorySchema = SchemaFactory.createForClass(History);
