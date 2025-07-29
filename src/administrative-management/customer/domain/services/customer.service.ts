import { Injectable, NotFoundException, BadRequestException  } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Customer } from '../entities/customer.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateCustomerDto } from '../../presentation/dto/update-customer.dto';
import { CreateCustomerDto } from '../../presentation/dto/create-customer.dto';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
  ) {}

  async create(data: CreateCustomerDto): Promise<Customer> {
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

  async findById(id: number): Promise<Customer> {
    const customer = await this.customerRepository.findOneBy({ id });

    if (!customer) {
      throw new NotFoundException(`Customer with id ${id} not found`);
    }

    return customer;
  }

  async update(id: number, data: UpdateCustomerDto): Promise<Customer> {
    const customer = await this.findById(id);
    Object.assign(customer, data);
    return this.customerRepository.save(customer);
  }

  async remove(id: number): Promise<void> {
    const customer = await this.findById(id);
    await this.customerRepository.softRemove(customer);
  }
}
