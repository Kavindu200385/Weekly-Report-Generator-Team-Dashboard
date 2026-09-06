import 'reflect-metadata';
import { config } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';

// This file runs outside Nest's bootstrap (TypeORM CLI / seed script via
// ts-node), so .env isn't auto-loaded by ConfigModule — load it explicitly.
config();

// The e2e suite spawns real `nest start` processes against this same
// config with NODE_ENV=test — route those at a separate `${DB_NAME}_test`
// database instead of the real dev database, so running tests can never
// leave throwaway accounts/reports in real data again.
const isTest = process.env.NODE_ENV === 'test';
export const testDatabaseName = `${process.env.DB_NAME}_test`;

// Runs outside Nest's DI (TypeORM CLI / migrations / seed script), so it
// reads process.env directly instead of going through ConfigService.
export const dataSourceOptions: DataSourceOptions = {
  type: 'mysql',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT ?? '3306', 10),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: isTest ? testDatabaseName : process.env.DB_NAME,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: false,
};

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
