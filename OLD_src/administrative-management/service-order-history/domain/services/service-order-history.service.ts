import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ServiceOrderHistory } from '../schema/service-order-history.schema';

@Injectable()
export class ServiceOrderHistoryService {
  constructor(
    @InjectModel(ServiceOrderHistory.name)
    private readonly orderHistoryModel: Model<ServiceOrderHistory>,
  ) {}

  async logStatusChange(
    idServiceOrder: number,
    userId: number,
    oldStatus: string,
    newStatus: string,
  ): Promise<ServiceOrderHistory> {
    const history = new this.orderHistoryModel({
      idServiceOrder,
      userId,
      oldStatus,
      newStatus,
      changedAt: new Date(),
    });

    return history.save();
  }

  async getHistoryByServiceOrderId(idServiceOrder: number): Promise<ServiceOrderHistory[]> {
    return this.orderHistoryModel
      .find({ idServiceOrder })
      .sort({ changedAt: 1 })
      .exec();
  }
}
