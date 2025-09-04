import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  serverUrl: text("server_url").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const albums = pgTable("albums", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  artist: text("artist").notNull(),
  coverArt: text("cover_art"),
  year: integer("year"),
  genre: text("genre"),
  trackCount: integer("track_count").default(0),
  duration: integer("duration").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const tracks = pgTable("tracks", {
  id: varchar("id").primaryKey(),
  title: text("title").notNull(),
  artist: text("artist").notNull(),
  album: text("album").notNull(),
  albumId: varchar("album_id").references(() => albums.id),
  duration: integer("duration").default(0),
  track: integer("track"),
  year: integer("year"),
  genre: text("genre"),
  coverArt: text("cover_art"),
  path: text("path").notNull(),
});

export const playlists = pgTable("playlists", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  comment: text("comment"),
  owner: text("owner").notNull(),
  public: boolean("public").default(false),
  songCount: integer("song_count").default(0),
  duration: integer("duration").default(0),
  created: timestamp("created").defaultNow().notNull(),
  changed: timestamp("changed").defaultNow().notNull(),
});

export const playHistory = pgTable("play_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  trackId: varchar("track_id").references(() => tracks.id).notNull(),
  playedAt: timestamp("played_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  serverUrl: true,
});

export const insertAlbumSchema = createInsertSchema(albums).omit({
  createdAt: true,
});

export const insertTrackSchema = createInsertSchema(tracks);

export const insertPlaylistSchema = createInsertSchema(playlists).omit({
  created: true,
  changed: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Album = typeof albums.$inferSelect;
export type Track = typeof tracks.$inferSelect;
export type Playlist = typeof playlists.$inferSelect;
export type PlayHistory = typeof playHistory.$inferSelect;

export interface Artist {
  id: string;
  name: string;
  coverArt: string | null;
  albumCount: number;
}

// API Response types for Subsonic/Navidrome
export interface SubsonicResponse<T = any> {
  'subsonic-response': {
    status: 'ok' | 'failed';
    version: string;
    type: string;
    serverVersion?: string;
    error?: {
      code: number;
      message: string;
    };
  } & T;
}

export interface NavidromeCredentials {
  serverUrl: string;
  username: string;
  password: string;
  token?: string;
  salt?: string;
}