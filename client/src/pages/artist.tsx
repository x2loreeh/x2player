import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { useAuthStore } from "@/stores/authStore";
import { navidromeService } from "@/services/navidrome";
import { MockNavidromeService } from "@/services/mockData";
import { AlbumCard } from "@/components/ui/album-card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Artist, Album } from "@shared/schema";
import { Music, Play, ChevronLeft } from "lucide-react";

export default function ArtistPage() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const { credentials } = useAuthStore();
  const artistId = params.id;

  const mockService = new MockNavidromeService();
  const activeService = credentials ? navidromeService : mockService;

  useEffect(() => {
    if (credentials) {
      navidromeService.setCredentials(credentials);
    }
  }, [credentials]);

  const { data: artist, isLoading: isLoadingArtist } = useQuery<Artist>({
    queryKey: ["/api/artist", artistId],
    queryFn: () => activeService.getArtist(artistId!),
    enabled: !!artistId,
  });

  const { data: albums, isLoading: isLoadingAlbums } = useQuery<Album[]>({
    queryKey: ["/api/artist/albums", artistId],
    queryFn: () => activeService.getArtistAlbums(artistId!),
    enabled: !!artistId,
  });

  const handleAlbumClick = (album: Album) => {
    setLocation(`/album/${album.id}`);
  };

  return (
    <div className="min-h-screen bg-dark-bg text-dark-text-primary pb-32">
      <div className="max-w-sm mx-auto">
        <div className="relative h-48">
          {isLoadingArtist ? (
            <Skeleton className="w-full h-full" />
          ) : (
            <>
              <div className="absolute inset-0 bg-gradient-to-t from-dark-bg to-transparent" />
              {artist?.coverArt ? (
                <img
                  src={artist.coverArt}
                  alt={artist.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                  <Music className="h-24 w-24 text-white opacity-60" />
                </div>
              )}
              <div className="absolute bottom-4 left-4">
                <h1 className="text-4xl font-bold text-white">{artist?.name}</h1>
              </div>
              <button
                onClick={() => window.history.back()}
                className="absolute top-4 left-4 bg-black/50 rounded-full p-2"
              >
                <ChevronLeft className="h-6 w-6 text-white" />
              </button>
            </>
          )}
        </div>

        <div className="p-4">
          <h2 className="text-2xl font-bold mb-4">Albums</h2>
          {isLoadingAlbums ? (
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="w-full aspect-square rounded-2xl bg-dark-border mb-2" />
                  <Skeleton className="h-4 w-3/4 bg-dark-border rounded" />
                  <Skeleton className="h-3 w-1/2 bg-dark-border rounded mt-1" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {albums?.map((album) => (
                <AlbumCard
                  key={album.id}
                  album={album}
                  onClick={() => handleAlbumClick(album)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}