import { Play } from "lucide-react";
import type { Album } from "../../types/types";
import { cn } from "../../lib/utils";

interface AlbumCardProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onClick"> {
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
              "rounded-[24px] object-cover mb-4",
              imageSizes[size]
            )}
          />
        ) : (
          <div
            className={cn(
              "bg-secondary rounded-[24px] flex items-center justify-center mb-4",
              imageSizes[size]
            )}
          >
            <Play className="h-8 w-8 text-muted-foreground" />
          </div>
        )}
        
        {showPlayButton && (
          <button
            className="absolute bottom-3 right-3 w-12 h-12 bg-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 shadow-xl"
          >
            <Play className="h-5 w-5 text-background ml-0.5" />
          </button>
        )}
      </div>
      
      <div className={cn("space-y-1", sizeClasses[size])}>
        <p className="font-semibold text-sm truncate text-foreground">
          {album.name}
        </p>
        <p className="text-muted-foreground text-xs truncate">
          {album.artist}
        </p>
      </div>
    </div>
  );
}