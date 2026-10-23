import 'dotenv/config';
import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });

try {
  await client.connect();
  await migrate(drizzle(client), { migrationsFolder: './drizzle' });
  console.log('MIGRATIONS APLICADAS');
} catch (err) {
  console.error('ERRO:', err);
} finally {
  await client.end();
}