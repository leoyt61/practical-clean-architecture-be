// @domain/repositories/userRepository.ts

import type { User } from '@domain/models/user';

export type UserRepository = {
  create(user: Omit<User, 'id'>): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
};
