import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Music, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/authStore";
import { usePlayerStore } from "@/stores/playerStore";
import { navidromeService } from "@/services/navidrome";
import { Skeleton } from "@/components/ui/skeleton";
import type { Playlist } from "@shared/schema";

export default function Playlists() {
  const { credentials } = useAuthStore();
  const { playQueue } = usePlayerStore();

  useEffect(() => {
    if (credentials) {
      navidromeService.setCredentials(credentials);
    }
  }, [credentials]);

  const { data: playlists, isLoading } = useQuery({
    queryKey: ["/api/playlists"],
    queryFn: () => navidromeService.getPlaylists(),
    enabled: !!credentials,
  });

  const handlePlaylistClick = async (playlist: Playlist) => {
    try {
      const tracks = await navidromeService.getPlaylistTracks(playlist.id);
      playQueue(tracks);
    } catch (error) {
      console.error("Failed to play playlist:", error);
    }
  };

  const userPlaylists = playlists?.filter(p => p.owner === credentials?.username) || [];
  const serverPlaylists = playlists?.filter(p => p.owner !== credentials?.username) || [];

  return (
    <div className="min-h-screen bg-dark-bg text-dark-text-primary pb-32">
      <div className="max-w-sm mx-auto">
        {/* Header */}
        <div className="px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Your Playlists</h1>
            <Button
              size="icon"
              className="w-10 h-10 bg-spotify-green hover:bg-green-600 rounded-full"
            >
              <Plus className="h-5 w-5 text-dark-bg" />
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="px-4 space-y-8">
            {/* User Playlists Skeleton */}
            <div>
              <Skeleton className="h-6 w-24 bg-dark-border mb-4" />
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="w-16 h-16 rounded-lg bg-dark-border" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32 bg-dark-border" />
                      <Skeleton className="h-3 w-16 bg-dark-border" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Server Playlists Skeleton */}
            <div>
              <Skeleton className="h-6 w-32 bg-dark-border mb-4" />
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="w-16 h-16 rounded-lg bg-dark-border" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32 bg-dark-border" />
                      <Skeleton className="h-3 w-24 bg-dark-border" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="px-4 space-y-8">
            {/* Made by You */}
            {userPlaylists.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-4">Made by you</h2>
                <div className="space-y-4">
                  {userPlaylists.map((playlist) => (
                    <div
                      key={playlist.id}
                      className="flex items-center space-x-4 cursor-pointer hover:bg-dark-surface p-2 -m-2 rounded-lg transition-colors"
                      onClick={() => handlePlaylistClick(playlist)}
                    >
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                        <Music className="text-white text-lg" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-dark-text-primary">
                          {playlist.name}
                        </p>
                        <p className="text-dark-text-secondary text-sm">
                          {playlist.songCount} songs
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Server Playlists */}
            {serverPlaylists.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-4">From your library</h2>
                <div className="space-y-4">
                  {serverPlaylists.map((playlist, index) => (
                    <div
                      key={playlist.id}
                      className="flex items-center space-x-4 cursor-pointer hover:bg-dark-surface p-2 -m-2 rounded-lg transition-colors"
                      onClick={() => handlePlaylistClick(playlist)}
                    >
                      <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
                        <Headphones className="text-white text-lg" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-dark-text-primary">
                          {playlist.name}
                        </p>
                        <p className="text-dark-text-secondary text-sm">
                          {playlist.comment ? `${playlist.comment} • ` : ""}
                          {playlist.songCount} songs
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Playlists */}
            {(!playlists || playlists.length === 0) && (
              <div className="text-center text-dark-text-secondary py-12">
                <Music className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No playlists found</h3>
                <p className="text-sm">Create your first playlist or check your Navidrome server</p>
                <Button className="mt-4 bg-spotify-green hover:bg-green-600 text-dark-bg">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Playlist
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
