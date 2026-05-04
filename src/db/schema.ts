import { pgTable, uuid, text, integer, timestamp, unique, boolean } from 'drizzle-orm/pg-core';

// Tables better-auth
export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').$defaultFn(() => false).notNull(),
  image: text('image'),
  createdAt: timestamp('created_at').$defaultFn(() => new Date()).notNull(),
  updatedAt: timestamp('updated_at').$defaultFn(() => new Date()).notNull(),
});

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
});

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
});

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').$defaultFn(() => new Date()),
  updatedAt: timestamp('updated_at').$defaultFn(() => new Date()),
});

export const artists = pgTable('artists', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  bio: text('bio'),
  photo_url: text('photo_url'),
  avatar_url: text('avatar_url'),
  born_year: integer('born_year'),
  death_year: integer('death_year'),
  created_at: timestamp('created_at').defaultNow(),
});

export const albums = pgTable('albums', {
  id: uuid('id').defaultRandom().primaryKey(),
  artist_id: uuid('artist_id').references(() => artists.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  slug: text('slug').notNull(),
  year: integer('year').notNull(),
  format: text('format'),
  label: text('label'),
  genre: text('genre'),
  image_url: text('image_url'),
  description: text('description'),
  credits: text('credits'),
});

export const tracks = pgTable('tracks', {
  id: uuid('id').defaultRandom().primaryKey(),
  album_id: uuid('album_id').references(() => albums.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  duration: text('duration'),
  image_url: text('image_url'),
  youtube_url: text('youtube_url'),
  lyrics_fr: text('lyrics_fr'),
  lyrics_original: text('lyrics_original'),
  context: text('context'),
  track_number: integer('track_number'),
});

export const contributions = pgTable('contributions', {
  id: uuid('id').defaultRandom().primaryKey(),
  type: text('type', { enum: ['lyrics', 'anecdote', 'link', 'media'] }).notNull(),
  content: text('content'),
  file_url: text('file_url'),
  track_id: uuid('track_id').references(() => tracks.id, { onDelete: 'set null' }),
  album_id: uuid('album_id').references(() => albums.id, { onDelete: 'set null' }),
  user_id: text('user_id'),
  status: text('status', { enum: ['pending', 'approved', 'rejected'] }).default('pending'),
  created_at: timestamp('created_at').defaultNow(),
});

export const likes = pgTable('likes', {
  id: uuid('id').defaultRandom().primaryKey(),
  user_id: text('user_id').notNull(),
  track_id: uuid('track_id').references(() => tracks.id, { onDelete: 'cascade' }),
  album_id: uuid('album_id').references(() => albums.id, { onDelete: 'cascade' }),
  artist_id: uuid('artist_id').references(() => artists.id, { onDelete: 'cascade' }),
  created_at: timestamp('created_at').defaultNow(),
});

export const playlists = pgTable('playlists', {
  id: uuid('id').defaultRandom().primaryKey(),
  user_id: text('user_id').notNull(),
  name: text('name').notNull(),
  created_at: timestamp('created_at').defaultNow(),
});

export const playlist_tracks = pgTable('playlist_tracks', {
  id: uuid('id').defaultRandom().primaryKey(),
  playlist_id: uuid('playlist_id').notNull().references(() => playlists.id, { onDelete: 'cascade' }),
  track_id: uuid('track_id').notNull().references(() => tracks.id, { onDelete: 'cascade' }),
  position: integer('position').notNull().default(0),
  added_at: timestamp('added_at').defaultNow(),
}, (t) => [unique().on(t.playlist_id, t.track_id)]);

export type Artist = typeof artists.$inferSelect;
export type Album = typeof albums.$inferSelect;
export type Track = typeof tracks.$inferSelect;
export type Contribution = typeof contributions.$inferSelect;
export type Like = typeof likes.$inferSelect;
export type Playlist = typeof playlists.$inferSelect;
export type PlaylistTrack = typeof playlist_tracks.$inferSelect;
