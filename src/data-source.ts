import { DataSource } from 'typeorm';
import { User } from './users/entities/user.entity';
import { Contact } from './contacts/entities/contact.entity';
export default new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 1234,
  username: 'postgres',
  password: 'abcd1234',
  database: 'chatapp',
  synchronize: false,
  logging: true,
  entities: [User, Contact],
  migrations: ['src/migrations/*.ts'],
});
