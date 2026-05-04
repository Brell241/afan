import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { magicLink } from 'better-auth/plugins';
import { Resend } from 'resend';
import { db } from '@/db';
import * as schema from '@/db/schema';

const resend = new Resend(process.env.RESEND_API_KEY);

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: 'pg', schema }),
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL ?? 'Afan <noreply@atekbot.space>',
          to: email,
          subject: 'Ton lien de connexion Afan',
          html: `
            <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
              <h2 style="margin:0 0 8px;font-size:20px">Connexion à Afan</h2>
              <p style="color:#666;margin:0 0 24px">Clique sur le bouton ci-dessous pour te connecter. Le lien expire dans 10 minutes.</p>
              <a href="${url}" style="display:inline-block;padding:12px 24px;background:#fff;color:#000;font-weight:600;border-radius:8px;text-decoration:none">
                Se connecter
              </a>
              <p style="color:#999;font-size:12px;margin:24px 0 0">Si tu n'as pas demandé ce lien, ignore cet email.</p>
            </div>
          `,
        });
      },
    }),
  ],
  trustedOrigins: [process.env.BETTER_AUTH_URL ?? 'http://localhost:3000'],
});
