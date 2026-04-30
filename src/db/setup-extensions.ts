import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);

async function setup() {
  await sql`CREATE EXTENSION IF NOT EXISTS unaccent`;
  await sql`CREATE EXTENSION IF NOT EXISTS pg_trgm`;
  console.log('Extensions unaccent et pg_trgm activées.');
}

setup().catch(console.error);
