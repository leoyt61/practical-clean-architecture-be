// @infra/repositories/userRepository/typeorm.ts

import type { User } from '@domain/models/user';
import type { UserRepository } from '@domain/repositories/userRepository';

import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from 'typeorm';

@Entity({ name: 'user' })
export class TypeormUser extends BaseEntity implements User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  @Column()
  password: string;
};

export class TypeormUserRepository implements UserRepository {
  create(user: Omit<User, 'id'>): Promise<User> {
    const userRepository = TypeormUser.getRepository();
    const newUser = userRepository.create(user);
    return userRepository.save(newUser);
  };

  async findByEmail(email: string): Promise<User | null> {
    const userRepository = TypeormUser.getRepository();
    return userRepository.findOne({ where: { email } });
  };
};
