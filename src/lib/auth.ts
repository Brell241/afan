import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { magicLink } from 'better-auth/plugins';
import { db } from '@/db';

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: 'pg' }),
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        // En production : envoyer via Resend / Nodemailer
        // En dev : afficher dans la console
        console.log(`[Magic Link] Email: ${email} → ${url}`);
      },
    }),
  ],
  trustedOrigins: [process.env.BETTER_AUTH_URL ?? 'http://localhost:3000'],
});
