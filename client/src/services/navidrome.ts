import axios, { AxiosInstance } from "axios";
import md5 from "md5";
import { Album, Artist, Song } from "../types/types";
import { useAuthStore } from "../stores/authStore";

export class NavidromeService {
  private api!: AxiosInstance;
  private username!: string;
  private token!: string;
  private salt!: string;

  setCredentials(credentials: {
    serverUrl: string;
    username: string;
    password?: string;
    token?: string;
    salt?: string;
  }) {
    this.api = axios.create({
      baseURL: `${credentials.serverUrl}/rest`,
    });
    this.username = credentials.username;

    this.api.interceptors.request.use((config) => {
      config.params = {
        u: this.username,
        t: this.token,
        s: this.salt,
        v: "1.16.1",
        c: "x2player",
        f: "json",
        ...config.params,
      };
      return config;
    });

    if (credentials.password) {
      const salt = Math.random().toString(36).substring(2, 12);
      const token = md5(credentials.password + salt);
      this.token = token;
      this.salt = salt;
    } else if (credentials.token && credentials.salt) {
      this.token = credentials.token;
      this.salt = credentials.salt;
    }
  }

  async ping(): Promise<boolean> {
    try {
      await this.api.get("ping.view", {
        params: {
          
        },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async login() {
    try {
      const response = await this.api.get("ping.view", {
        params: {
          
        },
      });
      if (response.data["subsonic-response"].status === "ok") {
        return {
          token: this.token,
          salt: this.salt,
          username: this.username,
        };
      } else {
        throw new Error("Login failed");
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async checkAuth() {
    try {
      const response = await this.api.get("ping.view", {
        params: { },
      });
      if (response.data["subsonic-response"].status === "ok") {
        return response.data["subsonic-response"];
      } else {
        throw new Error("Login failed");
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getArtists(
    musicFolderId?: string
  ): Promise<Artist[]> {
    try {
      const response = await this.api.get("getArtists.view", {
        params: {
          
          musicFolderId,
        },
      });
      const artists =
        response.data["subsonic-response"].artists.index
          .flatMap((index: any) => index.artist)
          .map((artist: any) => ({
            id: artist.id,
            name: artist.name,
            coverArt: artist.coverArt,
            albumCount: artist.albumCount,
          }));
      return artists;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getArtistAlbums(id: string): Promise<Album[]> {
    try {
      const response = await this.api.get("getArtist.view", {
        params: {
          
          id,
        },
      });
      const artistData = response.data["subsonic-response"].artist;
      const albums = artistData.album.map((album: any) => ({
        id: album.id,
        name: album.name,
        artist: album.artist,
        artistId: album.artistId,
        coverArt: album.coverArt ? this.getCoverArtUrl(album.coverArt) : null,
        trackCount: album.songCount,
        duration: album.duration,
        createdAt: new Date(album.created),
        year: album.year,
        genre: album.genre,
      }));
      return albums;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getArtist(id: string): Promise<Artist> {
    try {
      const response = await this.api.get("getArtist.view", {
        params: {
          
          id,
        },
      });
      const artistData = response.data["subsonic-response"].artist;
      const albums = artistData.album.map((album: any) => ({
        id: album.id,
        name: album.name,
        artist: album.artist,
        artistId: album.artistId,
        coverArt: album.coverArt ? this.getCoverArtUrl(album.coverArt) : null,
        trackCount: album.songCount,
        duration: album.duration,
        createdAt: new Date(album.created),
        year: album.year,
        genre: album.genre,
      }));
      return {
        id: artistData.id,
        name: artistData.name,
        coverArt: artistData.coverArt,
        albumCount: artistData.albumCount,
        artistInfo: {
          biography: artistData.artistInfo?.biography,
        },
        albums,
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async searchMusic(query: string): Promise<{ albums: Album[]; tracks: Song[] }> {
    try {
      const response = await this.api.get("search3.view", {
        params: {
          
          query,
          artistCount: 0,
          albumCount: 20,
          songCount: 20,
        },
      });
      const searchResult = response.data["subsonic-response"].searchResult3;

      const albums: Album[] = searchResult.album?.map((album: any) => ({
        id: album.id,
        name: album.name,
        artist: album.artist,
        artistId: album.artistId,
        coverArt: album.coverArt ? this.getCoverArtUrl(album.coverArt) : null,
        trackCount: album.songCount,
        duration: album.duration,
        createdAt: new Date(album.created),
        year: album.year,
        genre: album.genre,
      })) || [];

      const tracks: Song[] = searchResult.song?.map((song: any) => ({
        id: song.id,
        parent: song.parent,
        isDir: song.isDir,
        title: song.title,
        album: song.album,
        artist: song.artist,
        track: song.track,
        year: song.year,
        genre: song.genre,
        coverArt: song.coverArt ? this.getCoverArtUrl(song.coverArt) : null,
        size: song.size,
        contentType: song.contentType,
        suffix: song.suffix,
        duration: song.duration,
        bitRate: song.bitRate,
        path: this.getStreamUrl(song.id),
        playCount: song.playCount,
        created: song.created,
        albumId: song.albumId,
        artistId: song.artistId,
        type: song.type,
      })) || [];

      return { albums, tracks };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getNewestAlbums(
    type = "newest",
    size = 20,
    offset = 0
  ): Promise<Album[]> {
    try {
      const response = await this.api.get("getAlbumList.view", {
        params: {
          
          type,
          size,
          offset,
        },
      });
      const albums = response.data["subsonic-response"].albumList.album.map(
        (album: any) => ({
          id: album.id,
          name: album.name,
          artist: album.artist,
          artistId: album.artistId,
          coverArt: album.coverArt ? this.getCoverArtUrl(album.coverArt) : null,
          trackCount: album.songCount,
          duration: album.duration,
          createdAt: new Date(album.created),
          year: album.year,
          genre: album.genre,
        })
      );
      return albums;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getAlbumTracks(id: string): Promise<Song[]> {
    try {
      const response = await this.api.get("getAlbum.view", {
        params: {
          
          id,
        },
      });
      const albumData = response.data["subsonic-response"].album;
      const songs = albumData.song.map((song: any) => ({
        id: song.id,
        parent: song.parent,
        isDir: song.isDir,
        title: song.title,
        album: song.album,
        artist: song.artist,
        track: song.track,
        year: song.year,
        genre: song.genre,
        coverArt: song.coverArt ? this.getCoverArtUrl(song.coverArt) : null,
        size: song.size,
        contentType: song.contentType,
        suffix: song.suffix,
        duration: song.duration,
        bitRate: song.bitRate,
        path: this.getStreamUrl(song.id),
        playCount: song.playCount,
        created: song.created,
        albumId: song.albumId,
        artistId: song.artistId,
        type: song.type,
      }));
      return songs;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getAlbum(id: string): Promise<Album> {
    try {
      const response = await this.api.get("getAlbum.view", {
        params: {
          
          id,
        },
      });
      const albumData = response.data["subsonic-response"].album;
      const songs = albumData.song.map((song: any) => ({
        id: song.id,
        parent: song.parent,
        isDir: song.isDir,
        title: song.title,
        album: song.album,
        artist: song.artist,
        track: song.track,
        year: song.year,
        genre: song.genre,
        coverArt: song.coverArt ? this.getCoverArtUrl(song.coverArt) : null,
        size: song.size,
        contentType: song.contentType,
        suffix: song.suffix,
        duration: song.duration,
        bitRate: song.bitRate,
        path: this.getStreamUrl(song.id),
        playCount: song.playCount,
        created: song.created,
        albumId: song.albumId,
        artistId: song.artistId,
        type: song.type,
      }));
      return {
        id: albumData.id,
        name: albumData.name,
        artist: albumData.artist,
        artistId: albumData.artistId,
        coverArt: albumData.coverArt ? this.getCoverArtUrl(albumData.coverArt) : null,
        trackCount: albumData.songCount,
        duration: albumData.duration,
        createdAt: new Date(albumData.created),
        year: albumData.year,
        genre: albumData.genre,
        songs,
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getSong(id: string): Promise<Song> {
    try {
      const response = await this.api.get("getSong.view", {
        params: {
          
          id,
        },
      });
      const songData = response.data["subsonic-response"].song;
      return {
        id: songData.id,
        parent: songData.parent,
        isDir: songData.isDir,
        title: songData.title,
        album: songData.album,
        artist: songData.artist,
        track: songData.track,
        year: songData.year,
        genre: songData.genre,
        coverArt: songData.coverArt ? this.getCoverArtUrl(songData.coverArt) : null,
        size: songData.size,
        contentType: songData.contentType,
        suffix: songData.suffix,
        duration: songData.duration,
        bitRate: songData.bitRate,
        path: this.getStreamUrl(songData.id),
        playCount: songData.playCount,
        created: songData.created,
        albumId: songData.albumId,
        artistId: songData.artistId,
        type: songData.type,
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  private getTokenAndSalt() {
    const creds = useAuthStore.getState().credentials;
    if (!creds) return { t: "", s: "" };
    
    if (creds.token && creds.salt) return { t: creds.token, s: creds.salt };
    if (this.token && this.salt) return { t: this.token, s: this.salt };
    
    if (creds.password) {
      const s = Math.random().toString(36).substring(2, 12);
      const t = md5(creds.password + s);
      this.token = t;
      this.salt = s;
      return { t, s };
    }
    
    return { t: "", s: "" };
  }

  getStreamUrl(id: string, maxBitRate = 0) {
    const creds = useAuthStore.getState().credentials;
    if (!creds) return "";
    
    const { t, s } = this.getTokenAndSalt();
    const baseURL = this.api ? this.api.defaults.baseURL : `${creds.serverUrl}/rest`;

    return `${baseURL}/stream.view?u=${creds.username}&t=${t}&s=${s}&v=1.16.1&c=x2player&id=${id}&maxBitRate=${maxBitRate}`;
  }

  getCoverArtUrl(id: string, size?: number) {
    const creds = useAuthStore.getState().credentials;
    if (!creds) return "";
    
    const { t, s } = this.getTokenAndSalt();
    const baseURL = this.api ? this.api.defaults.baseURL : `${creds.serverUrl}/rest`;

    let url = `${baseURL}/getCoverArt.view?u=${creds.username}&t=${t}&s=${s}&v=1.16.1&c=x2player&id=${id}`;
    if (size) {
      url += `&size=${size}`;
    }
    return url;
  }

  async search(
    query: string,
    artistCount = 10,
    artistOffset = 0,
    albumCount = 10,
    albumOffset = 0,
    songCount = 20,
    songOffset = 0
  ) {
    try {
      const response = await this.api.get("search3.view", {
        params: {
          
          query,
          artistCount,
          artistOffset,
          albumCount,
          albumOffset,
          songCount,
          songOffset,
        },
      });
      const searchResult = response.data["subsonic-response"].searchResult3;
      return {
        artists: searchResult.artist?.map((artist: any) => ({
          id: artist.id,
          name: artist.name,
          coverArt: artist.coverArt ? this.getCoverArtUrl(artist.coverArt) : null,
          albumCount: artist.albumCount,
        })),
        albums: searchResult.album?.map((album: any) => ({
          id: album.id,
          name: album.name,
          artist: album.artist,
          artistId: album.artistId,
          coverArt: album.coverArt ? this.getCoverArtUrl(album.coverArt) : null,
          trackCount: album.songCount,
          duration: album.duration,
          created: new Date(album.created),
          year: album.year,
          genre: album.genre,
        })),
        songs: searchResult.song?.map((song: any) => ({
          id: song.id,
          parent: song.parent,
          isDir: song.isDir,
          title: song.title,
          album: song.album,
          artist: song.artist,
          track: song.track,
          year: song.year,
          genre: song.genre,
          coverArt: song.coverArt ? this.getCoverArtUrl(song.coverArt) : null,
          size: song.size,
          contentType: song.contentType,
          suffix: song.suffix,
          duration: song.duration,
          bitRate: song.bitRate,
          path: this.getStreamUrl(song.id),
          playCount: song.playCount,
          created: song.created,
          albumId: song.albumId,
          artistId: song.artistId,
          type: song.type,
        })),
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getPlaylists() {
    try {
      const response = await this.api.get("getPlaylists.view", {
        params: {
          
        },
      });
      const playlists =
        response.data["subsonic-response"].playlists.playlist.map(
          (playlist: any) => ({
            id: playlist.id,
            name: playlist.name,
            songCount: playlist.songCount,
            duration: playlist.duration,
            created: playlist.created,
            changed: playlist.changed,
            coverArt: playlist.coverArt ? this.getCoverArtUrl(playlist.coverArt) : null,
            owner: playlist.owner,
            public: playlist.public,
          })
        );
      return playlists;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getPlaylist(id: string) {
    try {
      const response = await this.api.get("getPlaylist.view", {
        params: {
          
          id,
        },
      });
      const playlistData = response.data["subsonic-response"].playlist;
      const songs =
        playlistData.entry?.map((song: any) => ({
          id: song.id,
          parent: song.parent,
          isDir: song.isDir,
          title: song.title,
          album: song.album,
          artist: song.artist,
          track: song.track,
          year: song.year,
          genre: song.genre,
          coverArt: song.coverArt ? this.getCoverArtUrl(song.coverArt) : null,
          size: song.size,
          contentType: song.contentType,
          suffix: song.suffix,
          duration: song.duration,
          bitRate: song.bitRate,
          path: this.getStreamUrl(song.id),
          playCount: song.playCount,
          created: song.created,
          albumId: song.albumId,
          artistId: song.artistId,
          type: song.type,
        })) || [];
      return {
        id: playlistData.id,
        name: playlistData.name,
        songCount: playlistData.songCount,
        duration: playlistData.duration,
        created: playlistData.created,
        changed: playlistData.changed,
        coverArt: playlistData.coverArt ? this.getCoverArtUrl(playlistData.coverArt) : null,
        owner: playlistData.owner,
        public: playlistData.public,
        songs,
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getPlaylistTracks(id: string): Promise<Song[]> {
    const playlist = await this.getPlaylist(id);
    return playlist.songs || [];
  }

  async createPlaylist(name: string, comment?: string, isPublic?: boolean, songs?: string[]) {
    try {
      const params: any = {
        
        name,
      };
      if (comment) params.comment = comment;
      if (isPublic !== undefined) params.public = isPublic;
      if (songs) params.songId = songs;

      const response = await this.api.get("createPlaylist.view", { params });
      return response.data["subsonic-response"];
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async updatePlaylist(
    id: string,
    name?: string,
    comment?: string,
    isPublic?: boolean,
    songsToAdd?: string[],
    songsToRemove?: number[]
  ) {
    try {
      const params: any = {
        
        playlistId: id,
      };
      if (name) params.name = name;
      if (comment) params.comment = comment;
      if (isPublic !== undefined) params.public = isPublic;
      if (songsToAdd) params.addSongId = songsToAdd;
      if (songsToRemove) params.removeSongIndex = songsToRemove;

      const response = await this.api.get("updatePlaylist.view", { params });
      return response.data["subsonic-response"];
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async reorderPlaylistTracks(playlistId: string, trackIds: string[]) {
    try {
      const response = await this.api.get("updatePlaylist.view", {
        params: {
          
          playlistId,
          songId: trackIds,
        },
      });
      return response.data["subsonic-response"];
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async deletePlaylist(id: string) {
    try {
      const response = await this.api.get("deletePlaylist.view", {
        params: {
          
          id,
        },
      });
      return response.data["subsonic-response"];
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async scanLibrary() {
    try {
      const response = await this.api.get("startScan.view", {
        params: {
          
        },
      });
      return response.data["subsonic-response"];
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

export const navidrome = new NavidromeService();