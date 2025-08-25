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

  async createPlaylist(name: string, imageFile?: File, songIds?: string[]): Promise<Playlist> {
    try {
      const formData = new FormData();
      formData.append('name', name);
      if (songIds) {
        songIds.forEach(id => formData.append('songId', id));
      }
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const response = await this.api.post('/createPlaylist', formData, {
        params: this.generateAuthParams(),
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data: SubsonicResponse<{ playlist: any }> = response.data;

      if (data['subsonic-response'].status === 'failed') {
        throw new Error(data['subsonic-response'].error?.message || 'Failed to create playlist');
      }

      const playlist = data['subsonic-response'].playlist;
      return {
        id: playlist.id,
        name: playlist.name,
        comment: playlist.comment,
        owner: playlist.owner,
        public: playlist.public || false,
        songCount: playlist.songCount || 0,
        duration: playlist.duration || 0,
        created: new Date(playlist.created || Date.now()),
        changed: new Date(playlist.changed || Date.now()),
      };
    } catch (error) {
      console.error('Failed to create playlist:', error);
      throw error;
    }
  }

  async deletePlaylist(playlistId: string): Promise<boolean> {
    try {
      const response = await this.api.post('/deletePlaylist', null, {
        params: {
          ...this.generateAuthParams(),
          id: playlistId,
        },
      });

      const data: SubsonicResponse = response.data;

      if (data['subsonic-response'].status === 'failed') {
        throw new Error(data['subsonic-response'].error?.message || 'Failed to delete playlist');
      }

      return data['subsonic-response'].status === 'ok';
    } catch (error) {
      console.error('Failed to delete playlist:', error);
      throw error;
    }
  }

  async updatePlaylist(playlistId: string, name?: string, comment?: string, public?: boolean, imageFile?: File, songIdsToAdd?: string[], songIndexesToRemove?: number[]): Promise<Playlist> {
    try {
      const formData = new FormData();
      formData.append('playlistId', playlistId);
      if (name) formData.append('name', name);
      if (comment) formData.append('comment', comment);
      if (public !== undefined) formData.append('public', public.toString());
      if (songIdsToAdd) {
        songIdsToAdd.forEach(id => formData.append('songIdToAdd', id));
      }
      if (songIndexesToRemove) {
        songIndexesToRemove.forEach(index => formData.append('songIndexToRemove', index.toString()));
      }
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const response = await this.api.post('/updatePlaylist', formData, {
        params: this.generateAuthParams(),
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data: SubsonicResponse<{ playlist: any }> = response.data;

      if (data['subsonic-response'].status === 'failed') {
        throw new Error(data['subsonic-response'].error?.message || 'Failed to update playlist');
      }

      const playlist = data['subsonic-response'].playlist;
      // Note: Navidrome's updatePlaylist response doesn't return the full playlist object.
      // You might need to call getPlaylist after updating to get the latest data.
      return this.getPlaylist(playlist.id); // Fetch updated playlist details
    } catch (error) {
      console.error('Failed to update playlist:', error);
      throw error;
    }
  }

  async reorderPlaylistTracks(playlistId: string, trackIds: string[]): Promise<boolean> {
    try {
      // Navidrome's reorderPlaylistEntries expects 'id' for the playlist and 'songId' array for the new order
      const response = await this.api.post('/reorderPlaylistEntries', null, {
        params: {
          ...this.generateAuthParams(),
          id: playlistId,
          songId: trackIds, // Array of song IDs in the desired order
        },
      });

      const data: SubsonicResponse = response.data;

      if (data['subsonic-response'].status === 'failed') {
        throw new Error(data['subsonic-response'].error?.message || 'Failed to reorder playlist tracks');
      }
      return data['subsonic-response'].status === 'ok';
    } catch (error) {
      console.error('Failed to reorder playlist tracks:', error);
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
