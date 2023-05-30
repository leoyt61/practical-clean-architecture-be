import "reflect-metadata";
import { DataSource } from "typeorm";
import { TypeormUser } from '@infra/repositories/userRepository/typeorm';

const dataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5433,
  username: "postgres",
  password: "123456789",
  database: "cleanarch",
  synchronize: true,
  logging: true,
  entities: [TypeormUser],
  subscribers: [],
  migrations: [],
});

export const configTypeorm = async () => {
  await dataSource.initialize();
};