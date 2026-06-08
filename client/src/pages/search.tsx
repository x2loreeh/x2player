import { useState, useCallback } from "react";
import { useLocation } from "wouter";
import { Search as SearchIcon, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useDebounce } from "use-debounce";

import { Album, Song } from "@/types/types";
import { usePlayerStore } from "@/stores/playerStore";
import { useCombinedSearch } from "@/hooks/useCombinedSearch";
import { AlbumCard } from "@/components/ui/album-card";
import { SongItem } from "@/components/ui/song-item";

const SearchPage = () => {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [searchText, setSearchText] = useState("");
  const [debouncedSearchText] = useDebounce(searchText, 500);

  const {
    albums: combinedAlbums,
    songs: combinedSongs,
    isLoading,
    getCoverArtUrl,
  } = useCombinedSearch(debouncedSearchText);

  const { isPlaying, currentTrack, playQueue, togglePlay } = usePlayerStore();

  const handlePlay = (song: Song) => {
    if (currentTrack?.id === song.id) {
      togglePlay();
      return;
    }
    playQueue(
      combinedSongs,
      combinedSongs.findIndex((s: Song) => s.id === song.id),
    );
  };

  const memoizedGetCoverArtUrl = useCallback(
    (coverArtId?: string) => {
      return getCoverArtUrl(coverArtId);
    },
    [getCoverArtUrl],
  );

  const handleAlbumClick = (album: Album) => {
    if (album.id.startsWith("local-album-")) {
      const songsToPlay = combinedSongs.filter(
        (song: Song) => song.album === album.name,
      );
      if (songsToPlay.length > 0) {
        playQueue(songsToPlay, 0);
      }
    } else {
      setLocation(`/album/${album.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-32">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md px-4 py-4 border-b border-white/5">
        <h1 className="text-3xl font-bold mb-4">{t("search.title", "Search")}</h1>
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <input
            type="text"
            className="w-full bg-secondary/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 transition-all"
            placeholder={t("search.placeholder", "Songs, Albums, or Artists")}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
      </div>

      <div className="px-4 py-6">
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {!isLoading && debouncedSearchText && (
          <div className="space-y-8">
            {combinedAlbums.length > 0 && (
              <section>
                <h2 className="text-xl font-bold mb-4">{t("search.albums", "Albums")}</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {combinedAlbums.map((album: Album) => (
                    <AlbumCard
                      key={album.id}
                      album={{
                        ...album,
                        coverArt:
                          memoizedGetCoverArtUrl(album.coverArt || undefined) ||
                          album.coverArt,
                      }}
                      onClick={() => handleAlbumClick(album)}
                    />
                  ))}
                </div>
              </section>
            )}

            {combinedSongs.length > 0 && (
              <section>
                <h2 className="text-xl font-bold mb-4">{t("search.songs", "Songs")}</h2>
                <div className="space-y-1">
                  {combinedSongs.map((song: Song) => (
                    <SongItem
                      key={song.id}
                      song={song}
                      isPlaying={isPlaying && currentTrack?.id === song.id}
                      onClick={() => handlePlay(song)}
                      coverArtUrl={memoizedGetCoverArtUrl(
                        song.coverArt || undefined,
                      )}
                    />
                  ))}
                </div>
              </section>
            )}

            {combinedAlbums.length === 0 && combinedSongs.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <p>No results found for "{debouncedSearchText}"</p>
              </div>
            )}
          </div>
        )}

        {!debouncedSearchText && (
          <div className="text-center py-12 text-muted-foreground">
            <SearchIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>Start typing to search your library</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;