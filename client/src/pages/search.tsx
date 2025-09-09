import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search as SearchIcon, Music, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/authStore";
import { usePlayerStore } from "@/stores/playerStore";
import { navidromeService } from "@/services/navidrome";
import { AlbumCard } from "@/components/ui/album-card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Album, Track } from "@shared/schema";

const musicCategories = [
  { name: "Rock", gradient: "from-purple-600 to-blue-600", icon: Music },
  { name: "Jazz", gradient: "from-green-600 to-teal-600", icon: Music },
  { name: "Pop", gradient: "from-red-600 to-pink-600", icon: Music },
  { name: "Electronic", gradient: "from-yellow-600 to-orange-600", icon: Music },
  { name: "Classical", gradient: "from-indigo-600 to-purple-600", icon: Music },
  { name: "Alternative", gradient: "from-teal-600 to-cyan-600", icon: Music },
];

export default function Search() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const { credentials } = useAuthStore();
  const { playTrack, playQueue } = usePlayerStore();

  useEffect(() => {
    if (credentials) {
      navidromeService.setCredentials(credentials);
    }
  }, [credentials]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ["/api/search", debouncedQuery],
    queryFn: () => navidromeService.searchMusic(debouncedQuery),
    enabled: !!credentials && !!debouncedQuery && debouncedQuery.length > 2,
  });

  const handleAlbumClick = async (album: Album) => {
    try {
      const tracks = await navidromeService.getAlbumTracks(album.id);
      playQueue(tracks);
    } catch (error) {
      console.error("Failed to play album:", error);
    }
  };

  const handleTrackClick = (track: Track) => {
    playTrack(track);
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-32">
      <div className="max-w-sm mx-auto">
        {/* Search Header */}
        <div className="px-4 py-6">
          <div className="relative">
            <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Artists, songs, or albums"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-3 bg-card border-border text-foreground placeholder-muted-foreground focus:border-primary"
            />
          </div>
        </div>

        {/* Search Results */}
        {debouncedQuery && debouncedQuery.length > 2 && (
          <div className="px-4 space-y-6">
            {isLoading ? (
              <div className="space-y-6">
                {/* Album Results Skeleton */}
                <div>
                  <Skeleton className="h-6 w-16 bg-muted mb-4" />
                  <div className="grid grid-cols-2 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i}>
                        <Skeleton className="w-full h-40 rounded-xl bg-muted mb-3" />
                        <Skeleton className="h-4 w-24 bg-muted mb-1" />
                        <Skeleton className="h-3 w-16 bg-muted" />
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Track Results Skeleton */}
                <div>
                  <Skeleton className="h-6 w-12 bg-muted mb-4" />
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center space-x-3">
                        <Skeleton className="w-12 h-12 rounded bg-muted" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-32 bg-muted" />
                          <Skeleton className="h-3 w-24 bg-muted" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : searchResults ? (
              <div className="space-y-8">
                {/* Albums */}
                {searchResults.albums && searchResults.albums.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Albums</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {searchResults.albums.slice(0, 6).map((album) => (
                        <AlbumCard
                          key={album.id}
                          album={album}
                          size="large"
                          onClick={handleAlbumClick}
                          showPlayButton
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Tracks */}
                {searchResults.tracks && searchResults.tracks.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Songs</h3>
                    <div className="space-y-2">
                      {searchResults.tracks.slice(0, 10).map((track) => (
                        <div
                          key={track.id}
                          className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                          onClick={() => handleTrackClick(track)}
                        >
                          {track.coverArt && (
                            <img
                              src={track.coverArt}
                              alt={`${track.title} cover`}
                              className="w-12 h-12 rounded object-cover"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate text-foreground">
                              {track.title}
                            </p>
                            <p className="text-muted-foreground text-xs truncate">
                              {track.artist} • {track.album}
                            </p>
                          </div>
                          <div className="flex items-center text-muted-foreground text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatDuration(track.duration || 0)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* No Results */}
                {(!searchResults.albums || searchResults.albums.length === 0) &&
                 (!searchResults.tracks || searchResults.tracks.length === 0) && (
                  <div className="text-center text-muted-foreground py-8">
                    <Music className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No results found for "{debouncedQuery}"</p>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        )}

        {/* Browse Categories (shown when not searching) */}
        {(!searchQuery || searchQuery.length <= 2) && (
          <div className="px-4 space-y-8">
            <div>
              <h2 className="text-xl font-bold mb-4">Browse all</h2>
              <div className="grid grid-cols-2 gap-4">
                {musicCategories.map((category) => (
                  <Button
                    key={category.name}
                    variant="ghost"
                    className={cn(
                      "bg-gradient-to-br rounded-xl p-4 h-24 relative cursor-pointer transition-all hover:scale-105 border-0",
                      category.gradient
                    )}
                    onClick={() => setSearchQuery(category.name)}
                  >
                    <div className="w-full h-full flex flex-col justify-between items-start">
                      <h3 className="font-bold text-lg text-white">{category.name}</h3>
                      <category.icon className="h-6 w-6 text-white opacity-80 self-end" />
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}