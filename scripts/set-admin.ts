import { db } from '../src/db';
import { sql } from 'drizzle-orm';

async function main() {
  const result = await db.execute(sql`
    UPDATE "user" SET role = 'admin' WHERE email = 'hyppoliteondo@gmail.com'
  `);
  console.log('Admin défini :', result.rowCount, 'ligne(s) mise(s) à jour');
  process.exit(0);
}

main().catch((err) => { console.error(err); process.exit(1); });
