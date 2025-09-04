import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { User, Music, Play } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { usePlayerStore } from "@/stores/playerStore";
import { navidromeService } from "@/services/navidrome";
import { MockNavidromeService } from "@/services/mockData";
import { AlbumCard } from "@/components/ui/album-card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Album, Artist } from "@shared/schema";

export default function Home() {
  const [, setLocation] = useLocation();
  const { credentials } = useAuthStore();
  const { playQueue } = usePlayerStore();
  
  // Use mock service when no credentials are available
  const mockService = new MockNavidromeService();
  const activeService = credentials ? navidromeService : mockService;

  useEffect(() => {
    if (credentials) {
      navidromeService.setCredentials(credentials);
    }
  }, [credentials]);

  const { data: recentAlbums, isLoading: isLoadingRecent } = useQuery({
    queryKey: ["/api/albums", "recent"],
    queryFn: () => activeService.getAlbums("recent", 6),
  });

  const { data: newestAlbums, isLoading: isLoadingNewest } = useQuery({
    queryKey: ["/api/albums", "newest"],
    queryFn: () => activeService.getAlbums("newest", 10),
  });

  const { data: randomAlbums, isLoading: isLoadingRandom } = useQuery({
    queryKey: ["/api/albums", "random"],
    queryFn: () => activeService.getAlbums("random", 6),
  });

  const { data: randomArtists, isLoading: isLoadingArtists } = useQuery({
    queryKey: ["/api/artists", "random"],
    queryFn: () => activeService.getArtists("random", 4),
  });

  const handleAlbumClick = (album: Album) => {
    setLocation(`/album/${album.id}`);
  };

  const handleArtistClick = (artist: Artist) => {
    // TODO: Implement artist page
    console.log("Clicked artist:", artist);
  };

  return (
    <div className="min-h-screen bg-dark-bg text-dark-text-primary pb-32">
      <div className="max-w-sm mx-auto">
        {/* Header */}
        <div className="px-4 py-6">
          <h1 className="text-3xl font-bold tracking-tight mb-4">
            [x2player]
          </h1>
        </div>

        {/* Recently Played */}
        <div className="px-4 mb-8">
          <h2 className="text-2xl font-bold mb-4">Ascoltati di recente</h2>
          {isLoadingRecent ? (
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="relative">
                  <Skeleton className="w-full aspect-square rounded-2xl bg-dark-border mb-3" />
                  <div className="absolute bottom-4 left-4 right-4 space-y-1">
                    <Skeleton className="h-5 w-28 bg-dark-border rounded" />
                    <Skeleton className="h-4 w-20 bg-dark-border rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {recentAlbums?.slice(0, 4).map((album) => (
                <div
                  key={album.id}
                  className="relative cursor-pointer transition-all duration-300 hover:scale-[1.02] group"
                  onClick={() => handleAlbumClick(album)}
                >
                  <div className="relative overflow-hidden rounded-2xl aspect-square">
                    {album.coverArt ? (
                      <img
                        src={album.coverArt}
                        alt={`${album.name} cover`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                        <Music className="h-12 w-12 text-white opacity-60" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-2xl">
                        <Play className="h-6 w-6 text-black ml-1" />
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                      <h3 className="font-bold text-white text-base truncate">
                        {album.name}
                      </h3>
                      <p className="text-white/70 text-sm truncate">
                        {album.artist}
                      </p>
                    </div>
                  </div>
                </div>
              )) || (
                <div className="col-span-2 text-center text-dark-text-secondary py-8">
                  <Music className="h-16 w-16 mx-auto mb-4 opacity-30" />
                  <p>No recent albums found</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Discovery Section */}
        <div className="px-4 mb-8">
          <h2 className="text-2xl font-bold mb-4">Discovery</h2>
          {isLoadingRandom ? (
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="relative">
                  <Skeleton className="w-full aspect-square rounded-2xl bg-dark-border" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {randomAlbums?.map((album) => (
                <div
                  key={album.id}
                  className="relative cursor-pointer transition-all duration-300 hover:scale-[1.02] group"
                  onClick={() => handleAlbumClick(album)}
                >
                  <div className="relative overflow-hidden rounded-2xl aspect-square">
                    {album.coverArt ? (
                      <img
                        src={album.coverArt}
                        alt={`${album.name} cover`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-white flex items-center justify-center">
                        <Music className="h-12 w-12 text-black opacity-60" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-2xl">
                        <Play className="h-6 w-6 text-black ml-1" />
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                      <h3 className="font-bold text-white text-base truncate">
                        {album.name}
                      </h3>
                      <p className="text-white/70 text-sm truncate">
                        {album.artist}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Artists Section */}
        <div className="px-4 mb-8">
          {isLoadingArtists ? (
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center">
                  <Skeleton className="w-32 h-32 rounded-full bg-dark-border" />
                  <Skeleton className="h-5 w-24 bg-dark-border rounded mt-2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {randomArtists?.map((artist) => (
                <div
                  key={artist.id}
                  className="flex flex-col items-center cursor-pointer transition-all duration-300 hover:scale-105 group"
                  onClick={() => handleArtistClick(artist)}
                >
                  <div className="relative w-32 h-32 rounded-full overflow-hidden">
                    {artist.coverArt ? (
                      <img
                        src={artist.coverArt}
                        alt={`${artist.name} cover`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-pink-500 to-yellow-500 flex items-center justify-center">
                        <User className="h-16 w-16 text-white opacity-70" />
                      </div>
                    )}
                  </div>
                  <h3 className="font-bold text-center mt-2 truncate w-32">
                    {artist.name}
                  </h3>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}