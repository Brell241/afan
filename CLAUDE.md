# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Démarrer le serveur de développement (port 3000)
npm run build        # Build de production
npm run lint         # ESLint

# Base de données
npm run db:push      # Pousser le schéma directement (dev, sans migration)
npm run db:generate  # Générer les fichiers de migration Drizzle
npm run db:migrate   # Appliquer les migrations
npm run db:studio    # Interface Drizzle Studio (visualiser la DB)

# Seed
npm run db:seed:all  # Seeder les 6 artistes en base
npx tsx src/seed/pcz.ts  # Seeder un seul artiste

# Script Python (recherche de données artiste)
python3 scripts/research_seed.py "Nom Artiste" slug-artiste
python3 scripts/research_seed.py "Nom Artiste" slug-artiste --yt-channel @Handle  # si pas sur Discogs
python3 scripts/research_seed.py "Nom Artiste" slug-artiste --no-youtube          # sans URLs YouTube
```

## Variables d'environnement (`.env.local`)

```
DATABASE_URL=           # Neon PostgreSQL (neon.tech)
BETTER_AUTH_SECRET=     # Secret pour better-auth
BETTER_AUTH_URL=        # Ex: http://localhost:3000
CLOUDINARY_CLOUD_NAME=  # Upload images
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

## Architecture

### Stack

- **Next.js 16** (App Router, React 19) — tous les Server Components par défaut
- **Drizzle ORM + Neon** — PostgreSQL serverless (`src/db/index.ts` utilise un Proxy pour instancier la DB à la demande)
- **better-auth** — authentification par magic link (`src/lib/auth.ts` / `src/lib/auth-client.ts`)
- **Cloudinary** — stockage des images (albums, artistes, tracks)
- **Tailwind CSS v4** + shadcn/ui (`src/components/ui/`) + `@base-ui/react`
- **Sonner** — notifications toast

### Schéma DB (`src/db/schema.ts`)

Quatre tables liées en cascade :
```
artists → albums → tracks
                → contributions (peut référencer un track OU un album)
```
Les `image_url` sont conservées lors du re-seed : le seed lit les URLs existantes avant de supprimer les albums, puis les réinjecte.

### Routing

```
/                           → Page d'accueil (liste des artistes + stats)
/artist/[slug]              → Fiche artiste (bio, timeline d'albums, artistes liés)
/artist/[slug]/album/[albumSlug]  → Page album (tracklist, paroles, contributions)
```

Les pages artiste et album utilisent `generateStaticParams` pour le SSG ; elles retournent `[]` si `DATABASE_URL` est absent.

### Lecteur audio (`src/lib/player-context.tsx`)

`PlayerProvider` wrap l'app entière via `ClientLayout`. Le lecteur fonctionne via l'**API YouTube IFrame** : un `<div>` hors-écran (`top:-400px`) contient le player YouTube réel. `usePlayer()` expose `play(track, album, artist, queue?)`, `togglePlay`, `seek`, `playNext`, `playPrev`. La queue courante permet l'auto-avance à la fin d'un morceau.

### Upload d'images

Trois routes API `PATCH` :
- `/api/upload/artist/[id]` — photo ou avatar artiste
- `/api/upload/album/[id]` — couverture album (800×800 crop)
- `/api/upload/track/[id]` — image track

Les uploads passent par `cloudinary.uploader.upload_stream` côté serveur.

### Contributions

`/api/contributions` (POST) — types : `lyrics | anecdote | link | media`, statut : `pending | approved | rejected`. La modération est manuelle (pas d'UI admin pour l'instant).

### Seed et script Python

`scripts/research_seed.py` génère un fichier `.ts` seed prêt à l'emploi. Sources :
1. **Wikipedia** FR puis EN pour la bio
2. **Discogs** (sans auth) pour la discographie + tracklists + labels
3. **Discogs `/artists/{id}`** en fallback bio si Wikipedia échoue
4. **YouTube** scraping (pas d'API key) pour les URLs vidéo par track

Les 6 artistes seedés : Pierre-Claver Zeng (PCZ), André Pépé Nzé, Annie-Flore Batchiellilys, Hilarion Nguema, Mack Joss, Oliver N'Goma.
