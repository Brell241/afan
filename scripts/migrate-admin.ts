import { db } from '../src/db';
import { sql } from 'drizzle-orm';

async function main() {
  console.log('Migration en cours…');

  await db.execute(sql`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user'`);
  console.log('✓ Colonne role ajoutée sur user');

  await db.execute(sql`ALTER TABLE contributions ADD COLUMN IF NOT EXISTS artist_id TEXT`);
  await db.execute(sql`ALTER TABLE contributions ADD COLUMN IF NOT EXISTS extra TEXT`);
  await db.execute(sql`ALTER TABLE contributions ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP`);
  await db.execute(sql`ALTER TABLE contributions ADD COLUMN IF NOT EXISTS reviewed_by TEXT`);
  console.log('✓ Colonnes ajoutées sur contributions');

  // Supprimer l'ancienne contrainte de type si elle existe, puis recréer avec les nouveaux types
  await db.execute(sql`ALTER TABLE contributions DROP CONSTRAINT IF EXISTS contributions_type_check`);
  await db.execute(sql`
    ALTER TABLE contributions
    ADD CONSTRAINT contributions_type_check
    CHECK (type IN ('lyrics', 'anecdote', 'link', 'media', 'add_artist', 'add_album'))
  `);
  console.log('✓ Contrainte type mise à jour');

  // Contrainte unique sur playlists.short_id (si manquante)
  await db.execute(sql`
    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'playlists_short_id_unique'
      ) THEN
        ALTER TABLE playlists ADD CONSTRAINT playlists_short_id_unique UNIQUE (short_id);
      END IF;
    END $$
  `);
  console.log('✓ Contrainte unique playlists.short_id assurée');

  // Passer l'admin
  const result = await db.execute(sql`UPDATE "user" SET role = 'admin' WHERE email = 'hyppoliteondo@gmail.com'`);
  console.log('✓ Admin défini pour hyppoliteondo@gmail.com', result);

  console.log('\nMigration terminée.');
  process.exit(0);
}

main().catch((err) => { console.error(err); process.exit(1); });
