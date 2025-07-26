import { Injectable, NotFoundException, BadRequestException  } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Customer } from '../entities/customer.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
  ) {}

  async create(data: Partial<Customer>): Promise<Customer> {
    const existing = await this.customerRepository.findOneBy({ cpf: data.cpf });

    if (existing) {
      throw new BadRequestException('CPF já cadastrado');
    }

    const customer = this.customerRepository.create(data);
    return this.customerRepository.save(customer);
  }

  async findAll(): Promise<Customer[]> {
    return this.customerRepository.find();
  }

  async findOne(id: string): Promise<Customer> {
    const customer = await this.customerRepository.findOneBy({ id });

    if (!customer) {
      throw new NotFoundException(`Customer with id ${id} not found`);
    }

    return customer;
  }

  async update(id: string, data: Partial<Customer>): Promise<Customer> {
    const customer = await this.findOne(id);
    Object.assign(customer, data);
    return this.customerRepository.save(customer);
  }

  async remove(id: string): Promise<void> {
    const customer = await this.findOne(id);
    await this.customerRepository.softRemove(customer);
  }
}
