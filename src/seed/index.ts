import { config } from 'dotenv';
config({ path: '.env.local' });

import { seed as seedPCZ } from './pcz';
import { seed as seedAndre } from './andre-pepe-nze';
import { seed as seedAnnieFlore } from './annie-flore';
import { seed as seedHilarion } from './hilarion-nguema';
import { seed as seedMackJoss } from './mack-joss';
import { seed as seedOliver } from './oliver-ngoma';

async function seedAll() {
  console.log('🌱 Seed global — 6 artistes\n');
  await seedPCZ();
  await seedAndre();
  await seedAnnieFlore();
  await seedHilarion();
  await seedMackJoss();
  await seedOliver();
  console.log('\n🌳 Tous les artistes sont seedés.');
}

seedAll().then(() => process.exit(0)).catch((err) => {
  console.error('Erreur seed global :', err);
  process.exit(1);
});
