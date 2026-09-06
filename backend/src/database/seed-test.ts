// Ensures the dedicated e2e test database exists and has the bare minimum
// the e2e suite assumes: a seeded manager@sitrep.test account (used by
// loginSeededManager / registerMember in test-utils/e2e-server.ts) and at
// least one project (some specs GET /projects and grab the first one).
// Idempotent — safe to run before every `npm test`.
//
// This builds its own DataSource pointed unconditionally at
// `${DB_NAME}_test`, rather than reusing the app's NODE_ENV-conditional
// DataSource — this script's only job is seeding the test database, so it
// must never depend on NODE_ENV happening to be set to "test" by whoever
// invokes it (a mistake here would silently write into the real database).
import 'reflect-metadata';
import { config } from 'dotenv';
import * as bcrypt from 'bcrypt';
import * as mysql from 'mysql2/promise';
import { DataSource } from 'typeorm';
import { User, UserRole } from '../users/entities/user.entity';
import { Project } from '../projects/entities/project.entity';

config();

const PASSWORD = 'Password123!';
const TEST_DB_NAME = `${process.env.DB_NAME}_test`;

async function ensureDatabaseExists() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT ?? '3306', 10),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });
  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${TEST_DB_NAME}\``);
  await conn.end();
}

async function run() {
  await ensureDatabaseExists();

  const dataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT ?? '3306', 10),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: TEST_DB_NAME,
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: true,
  });
  await dataSource.initialize();

  const userRepo = dataSource.getRepository(User);
  const projectRepo = dataSource.getRepository(Project);

  const existingManager = await userRepo.findOne({ where: { email: 'manager@sitrep.test' } });
  if (!existingManager) {
    await userRepo.save(
      userRepo.create({
        name: 'Test Manager',
        email: 'manager@sitrep.test',
        passwordHash: await bcrypt.hash(PASSWORD, 10),
        role: UserRole.MANAGER,
      }),
    );
    console.log(`Created manager@sitrep.test in ${TEST_DB_NAME}`);
  }

  const existingProjects = await projectRepo.count();
  if (existingProjects === 0) {
    await projectRepo.save(
      ['Client A', 'Internal Tooling', 'R&D'].map((name) =>
        projectRepo.create({ name, description: `${name} project workstream.`, isActive: true }),
      ),
    );
    console.log(`Created 3 projects in ${TEST_DB_NAME}`);
  }

  await dataSource.destroy();
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('seed-test failed:', err);
    process.exit(1);
  });
