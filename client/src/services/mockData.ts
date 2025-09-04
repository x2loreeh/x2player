import type {
  Album,
  Track,
  Playlist,
  Artist,
} from "../../../shared/schema";

// Mock album covers - using solid color gradients for demonstration
const mockCovers = [
  'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><defs><linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%23FF6B6B;stop-opacity:1" /><stop offset="100%" style="stop-color:%23FF8E8E;stop-opacity:1" /></linearGradient></defs><rect width="400" height="400" fill="url(%23g1)" /></svg>',
  'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><defs><linearGradient id="g2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%234ECDC4;stop-opacity:1" /><stop offset="100%" style="stop-color:%236BCF7F;stop-opacity:1" /></linearGradient></defs><rect width="400" height="400" fill="url(%23g2)" /></svg>',
  'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><defs><linearGradient id="g3" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%23845EC2;stop-opacity:1" /><stop offset="100%" style="stop-color:%23B39BC8;stop-opacity:1" /></linearGradient></defs><rect width="400" height="400" fill="url(%23g3)" /></svg>',
  'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><defs><linearGradient id="g4" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%23FF9671;stop-opacity:1" /><stop offset="100%" style="stop-color:%23FF6B9D;stop-opacity:1" /></linearGradient></defs><rect width="400" height="400" fill="url(%23g4)" /></svg>',
  'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><defs><linearGradient id="g5" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%23F9844A;stop-opacity:1" /><stop offset="100%" style="stop-color:%23FFB07A;stop-opacity:1" /></linearGradient></defs><rect width="400" height="400" fill="url(%23g5)" /></svg>',
  'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><defs><linearGradient id="g6" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%2300D2FF;stop-opacity:1" /><stop offset="100%" style="stop-color:%2300B4D8;stop-opacity:1" /></linearGradient></defs><rect width="400" height="400" fill="url(%23g6)" /></svg>',
  'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><defs><linearGradient id="g7" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%23A8E6CF;stop-opacity:1" /><stop offset="100%" style="stop-color:%2388D8A3;stop-opacity:1" /></linearGradient></defs><rect width="400" height="400" fill="url(%23g7)" /></svg>',
  'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><defs><linearGradient id="g8" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%23F8B500;stop-opacity:1" /><stop offset="100%" style="stop-color:%23FFD23F;stop-opacity:1" /></linearGradient></defs><rect width="400" height="400" fill="url(%23g8)" /></svg>',
];

export const mockAlbums: Album[] = [
  { id: '1', name: 'WHOLE LOTTA MUSIC', artist: 'YOUNG CARTI', coverArt: mockCovers[0], year: 2024, genre: 'Hip Hop', trackCount: 8, duration: 1800, createdAt: new Date('2024-08-14'), },
  { id: '2', name: 'OMERTÀ', artist: 'Playboi Carti', coverArt: mockCovers[1], year: 2024, genre: 'Hip Hop', trackCount: 12, duration: 2400, createdAt: new Date('2024-08-12'), },
  { id: '3', name: 'dont tap the glass', artist: 'xqvc', coverArt: mockCovers[2], year: 2024, genre: 'Electronic', trackCount: 6, duration: 1200, createdAt: new Date('2024-08-10'), },
  { id: '4', name: 'Whole Lotta Red V1', artist: 'playboi carti', coverArt: mockCovers[3], year: 2024, genre: 'Hip Hop', trackCount: 15, duration: 3000, createdAt: new Date('2024-08-08'), },
  { id: '5', name: 'Midnight Dreams', artist: 'Luna Eclipse', coverArt: mockCovers[4], year: 2024, genre: 'Ambient', trackCount: 10, duration: 2200, createdAt: new Date('2024-08-06'), },
  { id: '6', name: 'Digital Waves', artist: 'Synthwave Productions', coverArt: mockCovers[5], year: 2024, genre: 'Synthwave', trackCount: 9, duration: 1950, createdAt: new Date('2024-08-04'), },
  { id: '7', name: 'Forest Sessions', artist: 'Nature Sounds Collective', coverArt: mockCovers[6], year: 2024, genre: 'Ambient', trackCount: 7, duration: 1650, createdAt: new Date('2024-08-02'), },
  { id: '8', name: 'Golden Hour', artist: 'Sunset Boulevard', coverArt: mockCovers[7], year: 2024, genre: 'Indie', trackCount: 11, duration: 2650, createdAt: new Date('2024-07-30'), },
];

export const mockArtists: Artist[] = [
    { id: 'artist-1', name: 'YOUNG CARTI', coverArt: mockCovers[0], albumCount: 1 },
    { id: 'artist-2', name: 'Playboi Carti', coverArt: mockCovers[1], albumCount: 2 },
    { id: 'artist-3', name: 'xqvc', coverArt: mockCovers[2], albumCount: 1 },
    { id: 'artist-4', name: 'Luna Eclipse', coverArt: mockCovers[4], albumCount: 1 },
    { id: 'artist-5', name: 'Synthwave Productions', coverArt: mockCovers[5], albumCount: 1 },
    { id: 'artist-6', name: 'Nature Sounds Collective', coverArt: mockCovers[6], albumCount: 1 },
    { id: 'artist-7', name: 'Sunset Boulevard', coverArt: mockCovers[7], albumCount: 1 },
];

export const mockTracks: { [albumId: string]: Track[] } = {
  '1': [
    { id: '1-1', title: 'F1r3 Y0ur M4n4Ger', artist: 'YOUNG CARTI', album: 'WHOLE LOTTA MUSIC', albumId: '1', duration: 225, track: 1, year: 2024, genre: 'Hip Hop', coverArt: mockCovers[0], path: '#', },
    { id: '1-2', title: 'IseeY0ub4byB01', artist: 'YOUNG CARTI', album: 'WHOLE LOTTA MUSIC', albumId: '1', duration: 187, track: 2, year: 2024, genre: 'Hip Hop', coverArt: mockCovers[0], path: '#', },
    { id: '1-3', title: 'F1n3 sHit', artist: 'YOUNG CARTI', album: 'WHOLE LOTTA MUSIC', albumId: '1', duration: 203, track: 3, year: 2024, genre: 'Hip Hop', coverArt: mockCovers[0], path: '#', },
    { id: '1-4', title: 'Medium Length Song Title Test', artist: 'YOUNG CARTI', album: 'WHOLE LOTTA MUSIC', albumId: '1', duration: 165, track: 4, year: 2024, genre: 'Hip Hop', coverArt: mockCovers[0], path: '#', },
    { id: '1-5', title: 'QRc P4th V1', artist: 'YOUNG CARTI', album: 'WHOLE LOTTA MUSIC', albumId: '1', duration: 198, track: 5, year: 2024, genre: 'Hip Hop', coverArt: mockCovers[0], path: '#', },
    { id: '1-6', title: 'This Is A Very Long Song Title That Should Definitely Cause Layout Problems If Not Handled Properly', artist: 'YOUNG CARTI', album: 'WHOLE LOTTA MUSIC', albumId: '1', duration: 245, track: 6, year: 2024, genre: 'Hip Hop', coverArt: mockCovers[0], path: '#', },
  ],
  '2': [
    { id: '2-1', title: 'Silent Code', artist: 'Playboi Carti', album: 'OMERTÀ', albumId: '2', duration: 210, track: 1, year: 2024, genre: 'Hip Hop', coverArt: mockCovers[1], path: '#', },
    { id: '2-2', title: 'No Words', artist: 'Playboi Carti', album: 'OMERTÀ', albumId: '2', duration: 195, track: 2, year: 2024, genre: 'Hip Hop', coverArt: mockCovers[1], path: '#', },
  ],
  '3': [
    { id: '3-1', title: 'Fragile', artist: 'xqvc', album: 'dont tap the glass', albumId: '3', duration: 180, track: 1, year: 2024, genre: 'Electronic', coverArt: mockCovers[2], path: '#', },
    { id: '3-2', title: 'Careful Touch', artist: 'xqvc', album: 'dont tap the glass', albumId: '3', duration: 165, track: 2, year: 2024, genre: 'Electronic', coverArt: mockCovers[2], path: '#', },
  ],
};

export const mockPlaylists: Playlist[] = [
  { id: 'p1', name: 'My Favorites', comment: 'Best songs ever', owner: 'user', public: false, songCount: 25, duration: 5400, created: new Date('2024-08-01'), changed: new Date('2024-08-15'), },
  { id: 'p2', name: 'Chill Vibes', comment: '', owner: 'server', public: true, songCount: 18, duration: 3960, created: new Date('2024-07-15'), changed: new Date('2024-08-10'), },
];

export class MockNavidromeService {
  async ping(): Promise<boolean> {
    return true;
  }

  async getAlbums(type: 'newest' | 'recent' | 'frequent' | 'random' = 'newest', size = 20): Promise<Album[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    let albums = [...mockAlbums];
    switch (type) {
      case 'recent':
        albums = albums.slice(0, 4);
        break;
      case 'newest':
        albums = albums.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, size);
        break;
      case 'random':
        albums = albums.slice(2).concat(albums.slice(0, 2)).sort(() => Math.random() - 0.5).slice(0, size);
        break;
      default:
        albums = albums.slice(0, size);
    }
    return albums;
  }

  async getAlbumTracks(albumId: string): Promise<Track[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockTracks[albumId] || [];
  }

  async searchMusic(query: string): Promise<{ albums: Album[]; tracks: Track[]; artists: any[] }> {
    await new Promise(resolve => setTimeout(resolve, 400));
    const albums = mockAlbums.filter(album =>
      album.name.toLowerCase().includes(query.toLowerCase()) ||
      album.artist.toLowerCase().includes(query.toLowerCase())
    );
    const tracks = Object.values(mockTracks).flat().filter(track =>
      track.title.toLowerCase().includes(query.toLowerCase()) ||
      track.artist.toLowerCase().includes(query.toLowerCase()) ||
      track.album.toLowerCase().includes(query.toLowerCase())
    );
    return { albums, tracks, artists: [] };
  }

  async getAlbum(id: string): Promise<Album | undefined> {
    return this.generateMockAlbums(20).find((album) => album.id === id);
  }

  async getArtists(type: 'random' = 'random', size = 10, offset = 0): Promise<Artist[]> {
    console.log(`MockNavidromeService: getArtists(${type}, ${size}, ${offset})`);
    return this.generateMockArtists(size);
  }

  async getArtist(id: string): Promise<Artist> {
    const artist = mockArtists.find((a) => a.id === id);
    if (!artist) {
      throw new Error("Artist not found");
    }
    return Promise.resolve(artist);
  }

  async getArtistAlbums(artistId: string): Promise<Album[]> {
    const artist = mockArtists.find((a) => a.id === artistId);
    if (!artist) {
        return Promise.resolve([]);
    }
    const albums = mockAlbums.filter((album) => album.artist === artist.name);
    return Promise.resolve(albums);
  }

  async getPlaylists(): Promise<Playlist[]> {
    return Promise.resolve(mockPlaylists);
  }

  async getPlaylistTracks(playlistId: string): Promise<Track[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return Object.values(mockTracks).flat().slice(0, 5);
  }

  getStreamUrl(trackId: string): string {
    return '#';
  }

  setCredentials(credentials: any) {
    // Mock implementation - do nothing
  }

  private generateMockAlbums(count: number): Album[] {
    return Array.from({ length: count }, (_, i) => ({
      id: `album-${i}`,
      name: `Album ${i + 1}`,
      artist: `Artist ${i + 1}`,
      coverArt: `https://picsum.photos/seed/${i}/200`,
      year: 2023,
      genre: "Electronic",
      trackCount: 10,
      duration: 2400,
      createdAt: new Date(),
    }));
  }

  private generateMockArtists(count: number): Artist[] {
    return Array.from({ length: count }, (_, i) => ({
      id: `artist-${i}`,
      name: `Artist ${i + 1}`,
      coverArt: `https://picsum.photos/seed/artist${i}/200`,
      albumCount: Math.floor(Math.random() * 10) + 1,
    }));
  }

  private generateMockPlaylists(count: number): Playlist[] {
    return Array.from({ length: count }, (_, i) => ({
      id: `playlist-${i}`,
      name: `Playlist ${i + 1}`,
      comment: `This is a comment for playlist ${i + 1}`,
      owner: 'mockUser',
      public: Math.random() > 0.5,
      songCount: Math.floor(Math.random() * 50) + 5,
      duration: Math.floor(Math.random() * 10000) + 1200,
      created: new Date(),
      changed: new Date(),
    }));
  }

  private generateMockTracks(count: number): Track[] {
    return Array.from({ length: count }, (_, i) => ({
      id: `track-${i}`,
      title: `Track ${i + 1}`,
      artist: `Artist ${i % 5}`,
      album: `Album ${i % 2}`,
      albumId: `album-${i % 2}`,
      duration: 180 + Math.floor(Math.random() * 120),
      track: i + 1,
      year: 2023,
      genre: "Electronic",
      coverArt: `https://picsum.photos/seed/track${i}/200`,
      path: `mock/path/track-${i}.mp3`,
    }));
  }
}