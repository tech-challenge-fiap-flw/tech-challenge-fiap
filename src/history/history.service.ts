import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { History, HistoryDocument } from './schemas/history.schema';
import { CreateHistoryDto } from './dto/create-history.dto';
import { UpdateHistoryDto } from './dto/update-history.dto';

@Injectable()
export class HistoryService {
  constructor(
    @InjectModel(History.name) private historyModel: Model<HistoryDocument>,
  ) {}

  create(createHistoryDto: CreateHistoryDto) {
    const created = new this.historyModel(createHistoryDto);
    return created.save();
  }

  update(id: string, updateHistoryDto: UpdateHistoryDto) {
    return this.historyModel.findByIdAndUpdate(id, updateHistoryDto, { new: true }).exec();
  }

  findAll() {
    return this.historyModel.find().exec();
  }

  findOne(id: string) {
    return this.historyModel.findById(id).exec();
  }

  remove(id: string) {
    return this.historyModel.findByIdAndDelete(id).exec();
  }
}
