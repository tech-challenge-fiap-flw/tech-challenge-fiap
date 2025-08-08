import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class ServiceOrderHistory extends Document {
  @Prop({ required: true })
  idServiceOrder: number;

  @Prop({ required: true })
  userId: number;

  @Prop({ required: true })
  oldStatus: string;

  @Prop({ required: true })
  newStatus: string;

  @Prop({ default: Date.now })
  changedAt: Date;
}

export const ServiceOrderHistorySchema = SchemaFactory.createForClass(ServiceOrderHistory);
