import { create } from 'zustand';
import type { Track, Playlist } from '@shared/schema';

interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  queue: Track[];
  currentIndex: number;
  progress: number;
  duration: number;
  volume: number;
  isShuffled: boolean;
  repeatMode: 'none' | 'track' | 'queue';
  playlists: Playlist[];
  selectedPlaylist: Playlist | null;
  
  // Actions
  playTrack: (track: Track) => void;
  playQueue: (tracks: Track[], startIndex?: number) => void;
  togglePlay: () => void;
  nextTrack: () => void;
  previousTrack: () => void;
  seekTo: (position: number) => void;
  setVolume: (volume: number) => void;
  toggleShuffle: () => void;
  setRepeatMode: (mode: 'none' | 'track' | 'queue') => void;
  setPlaylists: (playlists: Playlist[]) => void;
  setSelectedPlaylist: (playlist: Playlist | null) => void;
  updateProgress: (progress: number, duration: number) => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentTrack: null,
  isPlaying: false,
  queue: [],
  currentIndex: 0,
  progress: 0,
  duration: 0,
  volume: 1,
  isShuffled: false,
  repeatMode: 'none',
  playlists: [],
  selectedPlaylist: null,
  
  playTrack: (track) => {
    set({
      currentTrack: track,
      queue: [track],
      currentIndex: 0,
      isPlaying: true,
    });
  },
  
  playQueue: (tracks, startIndex = 0) => {
    set({
      queue: tracks,
      currentIndex: startIndex,
      currentTrack: tracks[startIndex] || null,
      isPlaying: true,
    });
  },
  
  togglePlay: () => {
    set((state) => ({ isPlaying: !state.isPlaying }));
  },
  
  nextTrack: () => {
    const { queue, currentIndex, repeatMode } = get();
    let nextIndex = currentIndex + 1;
    
    if (nextIndex >= queue.length) {
      if (repeatMode === 'queue') {
        nextIndex = 0;
      } else {
        return;
      }
    }
    
    set({
      currentIndex: nextIndex,
      currentTrack: queue[nextIndex],
      isPlaying: true,
    });
  },
  
  previousTrack: () => {
    const { queue, currentIndex } = get();
    let prevIndex = currentIndex - 1;
    
    if (prevIndex < 0) {
      prevIndex = queue.length - 1;
    }
    
    set({
      currentIndex: prevIndex,
      currentTrack: queue[prevIndex],
      isPlaying: true,
    });
  },
  
  seekTo: (position) => {
    set({ progress: position });
  },
  
  setVolume: (volume) => {
    set({ volume: Math.max(0, Math.min(1, volume)) });
  },
  
  toggleShuffle: () => {
    set((state) => ({ isShuffled: !state.isShuffled }));
  },
  
  setRepeatMode: (mode) => {
    set({ repeatMode: mode });
  },
  
  updateProgress: (progress, duration) => {
    set({ progress, duration });
  },

  setPlaylists: (playlists) => {
    set({ playlists });
  },

  setSelectedPlaylist: (playlist) => {
    set({ selectedPlaylist: playlist });
  },
}));
