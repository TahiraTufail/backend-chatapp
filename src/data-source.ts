import { DataSource } from 'typeorm';
import { User } from './users/entities/user.entity';
export default new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 1234,
  username: 'postgres',
  password: 'abcd1234',
  database: 'chatapp',
  synchronize: false,
  logging: true,
  entities: [User],
  migrations: ['src/migrations/*.ts'],
});
