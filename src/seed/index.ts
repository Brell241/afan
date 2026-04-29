import { config } from 'dotenv';
config({ path: '.env.local' });

import { seed as seedPCZ } from './pcz';
import { seed as seedAndre } from './andre-pepe-nze';
import { seed as seedAnnieFlore } from './annie-flore';
import { seed as seedHilarion } from './hilarion-nguema';
import { seed as seedMackJoss } from './mack-joss';
import { seed as seedOliver } from './oliver-ngoma';
import { seed as seedPierreAkendengue } from './pierre-akendengue';
import { seed as seedVyckosEkondo } from './vyckos-ekondo';
import { seed as seedAngeleAssele } from './angele-assele';
import { seed as seedPatienceDabany } from './patience-dabany';

async function seedAll() {
  console.log('🌱 Seed global — 10 artistes\n');
  await seedPCZ();
  await seedAndre();
  await seedAnnieFlore();
  await seedHilarion();
  await seedMackJoss();
  await seedOliver();
  await seedPierreAkendengue();
  await seedVyckosEkondo();
  await seedAngeleAssele();
  await seedPatienceDabany();
  console.log('\n🌳 Tous les artistes sont seedés.');
}

seedAll().then(() => process.exit(0)).catch((err) => {
  console.error('Erreur seed global :', err);
  process.exit(1);
});
