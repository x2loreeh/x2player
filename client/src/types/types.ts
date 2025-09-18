export interface Artist {
  id: string;
  name: string;
  coverArt: string;
  albumCount: number;
  albums?: Album[];
  artistInfo?: {
    biography?: string;
  };
}

export interface NavidromeCredentials {
  serverUrl: string;
  username: string;
  password?: string;
  token?: string;
  salt?: string;
}

export interface Album {
  id: string;
  name: string;
  artist: string;
  artistId: string;
  coverArt: string | null;
  trackCount: number;
  duration: number;
  createdAt: Date;
  year: number | null;
  genre: string | null;
  songs?: Song[];
}

export interface Playlist {
  id: string;
  name: string;
  comment: string;
  owner: string;
  public: boolean;
  songCount: number;
  duration: number;
  created: Date;
  changed: Date;
  coverArt: string;
  songs?: Song[];
}

export interface Song {
  id: string;
  parent: string;
  isDir: boolean;
  title: string;
  album: string;
  artist: string;
  track: number;
  year: number;
  genre: string;
  coverArt: string | null;
  size: number;
  contentType: string;
  suffix: string;
  duration: number;
  bitRate: number;
  path: string;
  playCount: number;
  created: string;
  albumId: string;
  artistId: string;
  type: string;
}