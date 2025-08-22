import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import path from "path";
import fs from "fs";

export async function registerRoutes(app: Express): Promise<Server> {
  // PWA Manifest endpoint
  app.get('/manifest.json', (req, res) => {
    const manifest = {
      name: "x2player - Navidrome Music Client",
      short_name: "x2player",
      description: "A modern Progressive Web App music client for Navidrome",
      start_url: "/",
      display: "standalone",
      background_color: "#121212",
      theme_color: "#1DB954",
      icons: [
        {
          src: "data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%231DB954'%3e%3cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-3-7l4-3-4-3v6zm4-1l4 3V9l-4 3z'/%3e%3c/svg%3e",
          sizes: "any",
          type: "image/svg+xml",
          purpose: "any maskable"
        }
      ],
      categories: ["music", "entertainment"],
      shortcuts: [
        {
          name: "Search Music",
          short_name: "Search",
          description: "Search for songs, albums, and artists",
          url: "/search",
          icons: [
            {
              src: "data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ffffff'%3e%3cpath d='M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z'/%3e%3c/svg%3e",
              sizes: "96x96"
            }
          ]
        }
      ]
    };
    
    res.json(manifest);
  });

  // Service Worker (basic caching)
  app.get('/sw.js', (req, res) => {
    const swContent = `
const CACHE_NAME = 'x2player-v1';
const urlsToCache = [
  '/',
  '/static/css/main.css',
  '/static/js/main.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});
`;
    
    res.setHeader('Content-Type', 'application/javascript');
    res.send(swContent);
  });

  const httpServer = createServer(app);
  return httpServer;
}
