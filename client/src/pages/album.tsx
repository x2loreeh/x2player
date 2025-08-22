import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { ArrowLeft, Play, MoreHorizontal, Shuffle } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { usePlayerStore } from "@/stores/playerStore";
import { navidromeService } from "@/services/navidrome";
import { MockNavidromeService } from "@/services/mockData";
import { Button } from "@/components/ui/button";
import type { Album, Track } from "@shared/schema";

export default function AlbumPage() {
  const [, params] = useRoute("/album/:id");
  const [, setLocation] = useLocation();
  const [album, setAlbum] = useState<Album | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const { credentials } = useAuthStore();
  const { playQueue, playTrack } = usePlayerStore();
  
  // Use mock service when no credentials are available
  const mockService = new MockNavidromeService();
  const activeService = credentials ? navidromeService : mockService;

  useEffect(() => {
    if (credentials) {
      navidromeService.setCredentials(credentials);
    }
  }, [credentials]);

  useEffect(() => {
    if (params?.id) {
      loadAlbumData(params.id);
    }
  }, [params?.id]);

  const loadAlbumData = async (albumId: string) => {
    setIsLoading(true);
    try {
      // Get album tracks first (which includes album info in the response)
      const albumTracks = await activeService.getAlbumTracks(albumId);
      setTracks(albumTracks);

      // Create album object from first track
      if (albumTracks.length > 0) {
        const firstTrack = albumTracks[0];
        setAlbum({
          id: albumId,
          name: firstTrack.album,
          artist: firstTrack.artist,
          coverArt: firstTrack.coverArt,
          year: firstTrack.year,
          genre: firstTrack.genre,
          trackCount: albumTracks.length,
          duration: albumTracks.reduce((total, track) => total + (track.duration || 0), 0),
          createdAt: new Date(),
        });
      }
    } catch (error) {
      console.error("Failed to load album:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayAlbum = () => {
    if (tracks.length > 0) {
      playQueue(tracks);
    }
  };

  const handlePlayTrack = (track: Track, index: number) => {
    playQueue(tracks, index);
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-bg text-dark-text-primary">
        <div className="max-w-sm mx-auto">
          <div className="px-4 py-6">
            <div className="animate-pulse space-y-4">
              <div className="w-8 h-8 bg-dark-surface rounded-full"></div>
              <div className="w-full aspect-square bg-dark-surface rounded-2xl"></div>
              <div className="space-y-2">
                <div className="h-6 bg-dark-surface rounded w-48"></div>
                <div className="h-4 bg-dark-surface rounded w-32"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!album) {
    return (
      <div className="min-h-screen bg-dark-bg text-dark-text-primary flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg">Album not found</p>
          <Button onClick={() => setLocation("/")} className="mt-4">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg text-dark-text-primary pb-32">
      <div className="max-w-sm mx-auto">
        {/* Header */}
        <div className="px-4 py-6">
          <div className="flex items-center justify-start mb-6">
            <button
              onClick={() => setLocation("/")}
              className="w-10 h-10 bg-dark-surface rounded-full flex items-center justify-center hover:bg-dark-elevated transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          </div>

          {/* Album Art */}
          <div className="mb-6">
            <div className="relative overflow-hidden rounded-2xl aspect-square">
              {album.coverArt ? (
                <img
                  src={album.coverArt}
                  alt={`${album.name} cover`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-white flex items-center justify-center">
                  <Play className="h-16 w-16 text-black opacity-60" />
                </div>
              )}
            </div>
          </div>

          {/* Album Info */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-2">{album.name}</h1>
            <div className="flex items-center justify-between mb-1">
              <div>
                <p className="text-dark-text-secondary text-lg">
                  {album.artist}
                </p>
                <p className="text-dark-text-secondary text-sm">
                  {tracks.length} tracks • {Math.floor((album.duration || 0) / 60)} min
                </p>
              </div>
              {/* Play Buttons */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => {
                    if (tracks.length > 0) {
                      // Shuffle the tracks before playing
                      const shuffledTracks = [...tracks].sort(() => Math.random() - 0.5);
                      playQueue(shuffledTracks);
                    }
                  }}
                  className="w-12 h-12 bg-dark-surface rounded-full flex items-center justify-center hover:bg-dark-elevated transition-colors"
                >
                  <Shuffle className="h-5 w-5 text-white" />
                </button>
                <button
                  onClick={handlePlayAlbum}
                  className="w-12 h-12 bg-white rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-lg"
                >
                  <Play className="h-5 w-5 text-black ml-0.5" />
                </button>
              </div>
            </div>
            <div className="mb-4"></div>
          </div>

          {/* Track List */}
          <div className="space-y-2">
            {tracks.map((track, index) => (
              <div
                key={track.id}
                className="flex items-center py-2 cursor-pointer hover:bg-dark-surface -mx-2 px-2 rounded-lg transition-colors"
                onClick={() => handlePlayTrack(track, index)}
              >
                <div className="w-6 text-dark-text-secondary text-sm font-medium mr-4">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate">{track.title}</p>
                  <p className="text-dark-text-secondary text-sm">
                    {formatDate("Aug 14")} {/* You can update this with actual date */}
                  </p>
                </div>
                <div className="ml-4">
                  <MoreHorizontal className="h-5 w-5 text-dark-text-secondary" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}