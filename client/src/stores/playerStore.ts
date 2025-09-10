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
  likedSongs: string[]; // track IDs

  // Actions
  playTrack: (track: Track, queue?: Track[]) => void;
  playQueue: (tracks: Track[], startIndex?: number) => void;
  togglePlay: () => void;
  nextTrack: () => void;
  previousTrack: () => void;
  seekTo: (position: number) => void;
  setVolume: (volume: number) => void;
  toggleShuffle: () => void;
  setRepeatMode: () => void;
  setPlaylists: (playlists: Playlist[]) => void;
  setSelectedPlaylist: (playlist: Playlist | null) => void;
  updateProgress: (progress: number, duration: number) => void;
  toggleLike: (trackId: string) => void;
  addToQueue: (track: Track) => void;
  clearQueue: () => void;
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
  likedSongs: [],
  
  playTrack: (track, queue) => {
    const newQueue = queue && queue.length > 0 ? queue : [track];
    const newIndex = queue ? queue.findIndex(t => t.id === track.id) : 0;

    set({
      currentTrack: track,
      queue: newQueue,
      currentIndex: newIndex !== -1 ? newIndex : 0,
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
    const { queue, currentIndex, repeatMode, isShuffled } = get();
    if (queue.length === 0) return;

    if (repeatMode === 'track') {
      const audio = document.querySelector('audio');
      if (audio) audio.currentTime = 0;
      set({ isPlaying: true });
      return;
    }
    
    if (isShuffled) {
      const nextIndex = Math.floor(Math.random() * queue.length);
      set({
        currentIndex: nextIndex,
        currentTrack: queue[nextIndex],
        isPlaying: true,
      });
      return;
    }

    let nextIndex = currentIndex + 1;
    
    if (nextIndex >= queue.length) {
      if (repeatMode === 'queue') {
        nextIndex = 0;
      } else {
        set({ isPlaying: false });
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
    const { queue, currentIndex, repeatMode } = get();
    if (queue.length === 0) return;

    const audio = document.querySelector('audio');
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }

    let prevIndex = currentIndex - 1;
    
    if (prevIndex < 0) {
      if (repeatMode === 'queue') {
        prevIndex = queue.length - 1;
      } else {
        prevIndex = 0; // Go to start of track instead of wrapping
      }
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
  
  setRepeatMode: () => {
    const { repeatMode } = get();
    const modes: ('none' | 'track' | 'queue')[] = ['none', 'queue', 'track'];
    const nextIndex = (modes.indexOf(repeatMode) + 1) % modes.length;
    set({ repeatMode: modes[nextIndex] });
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

  toggleLike: (trackId) => {
    set((state) => {
      const { likedSongs } = state;
      if (likedSongs.includes(trackId)) {
        return { likedSongs: likedSongs.filter((id) => id !== trackId) };
      } else {
        return { likedSongs: [...likedSongs, trackId] };
      }
    });
  },

  addToQueue: (track) => {
    set((state) => ({
      queue: [...state.queue, track],
    }));
  },

  clearQueue: () => {
    set({
      queue: [],
      currentTrack: null,
      currentIndex: 0,
      isPlaying: false,
    });
  },
}));