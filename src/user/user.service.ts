import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  create(name: string): Promise<User> {
    const user = this.userRepository.create({ name });
    return this.userRepository.save(user);
  }

  findAll(): Promise<User[]> {
    return this.userRepository.find();
  }
}
