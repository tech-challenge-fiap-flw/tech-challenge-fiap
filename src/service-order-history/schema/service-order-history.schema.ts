import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  collection: 'service_order_history',
  timestamps: true 
})
export class ServiceOrderHistory {
  @Prop({ required: true })
  idServiceOrder: number;

  @Prop({ required: true })
  userId: number;

  @Prop({ required: false })
  oldStatus: string;

  @Prop({ required: true })
  newStatus: string;

  @Prop({ default: Date.now })
  changedAt: Date;
}

export const ServiceOrderHistorySchema = SchemaFactory.createForClass(ServiceOrderHistory);
