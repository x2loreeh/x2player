import axios, { AxiosInstance } from 'axios';
import { md5 } from 'js-md5';
import type { NavidromeCredentials, SubsonicResponse, Album, Track, Playlist } from '@shared/schema';

class NavidromeService {
  private api: AxiosInstance;
  private credentials: NavidromeCredentials | null = null;

  constructor() {
    this.api = axios.create();
  }

  setCredentials(credentials: NavidromeCredentials) {
    this.credentials = credentials;
    this.api = axios.create({
      baseURL: `${credentials.serverUrl}/rest`,
      timeout: 10000,
    });
  }

  private generateAuthParams() {
    if (!this.credentials) {
      throw new Error('No credentials set');
    }

    const salt = Math.random().toString(36).substring(2, 15);
    const token = md5(this.credentials.password + salt);

    return {
      u: this.credentials.username,
      t: token,
      s: salt,
      v: '1.16.1',
      c: 'x2player',
      f: 'json',
    };
  }

  async ping(): Promise<boolean> {
    try {
      const response = await this.api.get('/ping', {
        params: this.generateAuthParams(),
      });
      
      const data: SubsonicResponse = response.data;
      return data['subsonic-response'].status === 'ok';
    } catch (error) {
      console.error('Ping failed:', error);
      return false;
    }
  }

  async getAlbums(type: 'newest' | 'recent' | 'frequent' | 'random' = 'newest', size = 20, offset = 0): Promise<Album[]> {
    try {
      const response = await this.api.get('/getAlbumList2', {
        params: {
          ...this.generateAuthParams(),
          type,
          size,
          offset,
        },
      });

      const data: SubsonicResponse<{ albumList2: { album: any[] } }> = response.data;
      
      if (data['subsonic-response'].status === 'failed') {
        throw new Error(data['subsonic-response'].error?.message || 'Failed to fetch albums');
      }

      return data['subsonic-response'].albumList2?.album?.map(album => ({
        id: album.id,
        name: album.name,
        artist: album.artist,
        coverArt: album.coverArt ? `${this.credentials?.serverUrl}/rest/getCoverArt?id=${album.coverArt}&${new URLSearchParams(this.generateAuthParams()).toString()}` : null,
        year: album.year,
        genre: album.genre,
        trackCount: album.songCount || 0,
        duration: album.duration || 0,
        createdAt: new Date(album.created || Date.now()),
      })) || [];
    } catch (error) {
      console.error('Failed to fetch albums:', error);
      throw error;
    }
  }

  async searchMusic(query: string): Promise<{ albums: Album[]; tracks: Track[]; artists: any[] }> {
    try {
      const response = await this.api.get('/search3', {
        params: {
          ...this.generateAuthParams(),
          query,
          albumCount: 20,
          songCount: 20,
          artistCount: 20,
        },
      });

      const data: SubsonicResponse<{ searchResult3: any }> = response.data;
      
      if (data['subsonic-response'].status === 'failed') {
        throw new Error(data['subsonic-response'].error?.message || 'Search failed');
      }

      const result = data['subsonic-response'].searchResult3 || {};
      
      return {
        albums: result.album?.map((album: any) => ({
          id: album.id,
          name: album.name,
          artist: album.artist,
          coverArt: album.coverArt ? `${this.credentials?.serverUrl}/rest/getCoverArt?id=${album.coverArt}&${new URLSearchParams(this.generateAuthParams()).toString()}` : null,
          year: album.year,
          genre: album.genre,
          trackCount: album.songCount || 0,
          duration: album.duration || 0,
          createdAt: new Date(album.created || Date.now()),
        })) || [],
        tracks: result.song?.map((song: any) => ({
          id: song.id,
          title: song.title,
          artist: song.artist,
          album: song.album,
          albumId: song.albumId,
          duration: song.duration || 0,
          track: song.track,
          year: song.year,
          genre: song.genre,
          coverArt: song.coverArt ? `${this.credentials?.serverUrl}/rest/getCoverArt?id=${song.coverArt}&${new URLSearchParams(this.generateAuthParams()).toString()}` : null,
          path: `${this.credentials?.serverUrl}/rest/stream?id=${song.id}&${new URLSearchParams(this.generateAuthParams()).toString()}`,
        })) || [],
        artists: result.artist || [],
      };
    } catch (error) {
      console.error('Search failed:', error);
      throw error;
    }
  }

  async getPlaylists(): Promise<Playlist[]> {
    try {
      const response = await this.api.get('/getPlaylists', {
        params: this.generateAuthParams(),
      });

      const data: SubsonicResponse<{ playlists: { playlist: any[] } }> = response.data;
      
      if (data['subsonic-response'].status === 'failed') {
        throw new Error(data['subsonic-response'].error?.message || 'Failed to fetch playlists');
      }

      return data['subsonic-response'].playlists?.playlist?.map(playlist => ({
        id: playlist.id,
        name: playlist.name,
        comment: playlist.comment,
        owner: playlist.owner,
        public: playlist.public || false,
        songCount: playlist.songCount || 0,
        duration: playlist.duration || 0,
        created: new Date(playlist.created || Date.now()),
        changed: new Date(playlist.changed || Date.now()),
      })) || [];
    } catch (error) {
      console.error('Failed to fetch playlists:', error);
      throw error;
    }
  }

  async getPlaylistTracks(playlistId: string): Promise<Track[]> {
    try {
      const response = await this.api.get('/getPlaylist', {
        params: {
          ...this.generateAuthParams(),
          id: playlistId,
        },
      });

      const data: SubsonicResponse<{ playlist: { entry: any[] } }> = response.data;
      
      if (data['subsonic-response'].status === 'failed') {
        throw new Error(data['subsonic-response'].error?.message || 'Failed to fetch playlist tracks');
      }

      return data['subsonic-response'].playlist?.entry?.map(song => ({
        id: song.id,
        title: song.title,
        artist: song.artist,
        album: song.album,
        albumId: song.albumId,
        duration: song.duration || 0,
        track: song.track,
        year: song.year,
        genre: song.genre,
        coverArt: song.coverArt ? `${this.credentials?.serverUrl}/rest/getCoverArt?id=${song.coverArt}&${new URLSearchParams(this.generateAuthParams()).toString()}` : null,
        path: `${this.credentials?.serverUrl}/rest/stream?id=${song.id}&${new URLSearchParams(this.generateAuthParams()).toString()}`,
      })) || [];
    } catch (error) {
      console.error('Failed to fetch playlist tracks:', error);
      throw error;
    }
  }

  async getAlbumTracks(albumId: string): Promise<Track[]> {
    try {
      const response = await this.api.get('/getAlbum', {
        params: {
          ...this.generateAuthParams(),
          id: albumId,
        },
      });

      const data: SubsonicResponse<{ album: { song: any[] } }> = response.data;
      
      if (data['subsonic-response'].status === 'failed') {
        throw new Error(data['subsonic-response'].error?.message || 'Failed to fetch album tracks');
      }

      return data['subsonic-response'].album?.song?.map(song => ({
        id: song.id,
        title: song.title,
        artist: song.artist,
        album: song.album,
        albumId: song.albumId,
        duration: song.duration || 0,
        track: song.track,
        year: song.year,
        genre: song.genre,
        coverArt: song.coverArt ? `${this.credentials?.serverUrl}/rest/getCoverArt?id=${song.coverArt}&${new URLSearchParams(this.generateAuthParams()).toString()}` : null,
        path: `${this.credentials?.serverUrl}/rest/stream?id=${song.id}&${new URLSearchParams(this.generateAuthParams()).toString()}`,
      })) || [];
    } catch (error) {
      console.error('Failed to fetch album tracks:', error);
      throw error;
    }
  }

  getStreamUrl(trackId: string): string {
    if (!this.credentials) {
      throw new Error('No credentials set');
    }
    
    const params = new URLSearchParams(this.generateAuthParams());
    return `${this.credentials.serverUrl}/rest/stream?id=${trackId}&${params.toString()}`;
  }
}

export const navidromeService = new NavidromeService();
