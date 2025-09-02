import { Play, Plus } from "lucide-react";
import type { Album, Song } from "@shared/schema";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { navidromeService } from "@/services/navidrome";
import { usePlayerStore } from "@/stores/playerStore";
import { useState } from "react";

interface AlbumCardProps extends React.HTMLAttributes<HTMLDivElement> {
  album: Album;
  size?: "small" | "medium" | "large";
  onClick?: (album: Album) => void;
  showPlayButton?: boolean;
}
// Assuming album.songs exists and is an array of Song objects


export function AlbumCard({
  album,
  size = "medium",
  onClick,
  // Removed onAddSongToPlaylist as it's now handled internally
  // onAddSongToPlaylist,

  showPlayButton = false,
  ...props
}: AlbumCardProps & { onAddSongToPlaylist?: (song: Song) => void }) { // Added onAddSongToPlaylist prop
  const sizeClasses = {
    small: "w-32",
    medium: "w-40",
    large: "w-full",
  };

  const imageSizes = {
    small: "w-32 h-32",
    medium: "w-40 h-40",
    large: "w-full h-40",
  };

  const { toast } = useToast();
  const playlists = usePlayerStore((state) => state.playlists);
  const [isAddingToPlaylist, setIsAddingToPlaylist] = useState(false);

  // Assuming album.songs exists and is an array of Song objects
  // Assuming album.songs exists and is an array of Song objects
  return (
    <div
      className={cn(
        "cursor-pointer transition-all duration-200 hover:scale-105 group",
        sizeClasses[size]
      )}
      {...props} // Spread other props like onClick
    >
      <div className="relative">
        {album.coverArt ? (
          <img
            src={album.coverArt}
            alt={`${album.name} cover`}
            className={cn(
              "rounded-xl object-cover mb-3",
              imageSizes[size]
            )}
          />
        ) : (
          <div
            className={cn(
              "bg-dark-surface rounded-xl flex items-center justify-center mb-3",
              imageSizes[size]
            )}
          >
            <Play className="h-8 w-8 text-dark-text-secondary" />
          </div>
        )}
        
        {/* Add context menu for individual songs if displaying tracks */}
        {album.songs && album.songs.length > 0 && (
          <div className="absolute inset-0">
            {album.songs.map((song) => (
              <DropdownMenu key={song.id} open={isAddingToPlaylist} onOpenChange={setIsAddingToPlaylist}>
                <DropdownMenuTrigger asChild>
                  <button className="absolute top-1 right-1 p-1 rounded-full hover:bg-dark-surface transition-colors opacity-0 group-hover:opacity-100">
                    <Plus className="h-4 w-4 text-dark-text-secondary" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {playlists.map((playlist) => (
                    <DropdownMenuItem
                      key={playlist.id}
                      onClick={async () => {
                        try {
                          await navidromeService.addTrackToPlaylist(playlist.id, song.id);
                          toast({
                            title: "Success",
                            description: `${song.title} added to ${playlist.name}`,
                          });
                        } catch (error) {
                          console.error("Failed to add song to playlist:", error);
                          toast({
                            title: "Error",
                            description: `Failed to add ${song.title} to playlist.`,
                            variant: "destructive",
                          });
                        } finally {
                          setIsAddingToPlaylist(false);
                        }
                      }}
                    >
                      Add to {playlist.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ))}
          </div>
        )}

        {showPlayButton && (
          <button
            className="absolute bottom-2 right-2 w-12 h-12 bg-spotify-green rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 shadow-lg"
            onClick={() => onClick?.(album)} // Added onClick to play the album
          >
            <Play className="h-5 w-5 text-dark-bg ml-0.5" />
          </button>
        )}
      </div>
      
      <div className={cn("space-y-1", sizeClasses[size])}>
        <p className="font-semibold text-sm truncate text-dark-text-primary">
          {album.name}
        </p>
        <p className="text-dark-text-secondary text-xs truncate">
          {album.artist}
        </p>
        {album.year && (
          <p className="text-dark-text-secondary text-xs">
            {album.year}
          </p>
        )}
      </div>
    </div>
  );
}