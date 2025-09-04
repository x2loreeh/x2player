import { Play } from "lucide-react";
import type { Album } from "@shared/schema";
import { cn } from "@/lib/utils";

interface AlbumCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onClick'> {
  album: Album;
  size?: "small" | "medium" | "large";
  onClick?: (album: Album) => void;
  showPlayButton?: boolean;
}

export function AlbumCard({
  album,
  size = "medium",
  onClick,
  showPlayButton = false,
  ...props
}: AlbumCardProps) {
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

  return (
    <div
      className={cn(
        "cursor-pointer transition-all duration-200 hover:scale-105 group",
        sizeClasses[size]
      )}
      onClick={() => onClick?.(album)}
      {...props}
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
        
        {showPlayButton && (
          <button
            className="absolute bottom-2 right-2 w-12 h-12 bg-spotify-green rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 shadow-lg"
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
      </div>
    </div>
  );
}