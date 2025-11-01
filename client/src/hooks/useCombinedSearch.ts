import { useMemo, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSettingsStore } from "@/stores/settingsStore";
import { useLocalFilesStore } from "@/stores/localFilesStore";
import { useAuthStore } from "@/stores/authStore";
import { NavidromeService } from "@/services/navidrome";
import { Album, Song } from "@/types/types";

export const useCombinedSearch = (debouncedSearchText: string) => {
  const { dataSource } = useSettingsStore();
  const credentials = useAuthStore((s) => s.credentials);
  const { files: localSongs } = useLocalFilesStore();
  const [navidromeService, setNavidromeService] = useState<NavidromeService>();

  useEffect(() => {
    if (credentials) {
      const service = new NavidromeService();
      service.setCredentials(credentials);
      setNavidromeService(service);
    }
  }, [credentials]);

  const shouldFetchNavidrome =
    (dataSource === "navidrome" || dataSource === "both") &&
    !!debouncedSearchText &&
    !!navidromeService;

  const { data: navidromeResults, isLoading } = useQuery({
    queryKey: ["search", debouncedSearchText],
    queryFn: () => navidromeService?.search(debouncedSearchText),
    enabled: shouldFetchNavidrome,
  });

  const localResults = useMemo(() => {
    if (
      (dataSource !== "local" && dataSource !== "both") ||
      !debouncedSearchText
    ) {
      return { albums: [], songs: [] };
    }

    const query = debouncedSearchText.toLowerCase();
    const filteredSongs = localSongs.filter(
      (song) =>
        song.title.toLowerCase().includes(query) ||
        song.artist?.toLowerCase().includes(query) ||
        song.album?.toLowerCase().includes(query)
    );

    const albumMap = new Map<string, Song[]>();
    filteredSongs.forEach((song) => {
      if (song.album) {
        if (!albumMap.has(song.album)) {
          albumMap.set(song.album, []);
        }
        albumMap.get(song.album)!.push(song);
      }
    });

    const albums: Album[] = [];
    albumMap.forEach((songs, albumName) => {
      const firstSong = songs[0];
      const artistName = firstSong.artist || "Unknown Artist";
      albums.push({
        id: `local-album-${albumName}-${artistName}`,
        name: albumName,
        artist: artistName,
        coverArt: firstSong.coverArt || "",
        songCount: songs.length,
        year: firstSong.year,
      });
    });

    return { albums, songs: filteredSongs };
  }, [debouncedSearchText, localSongs, dataSource]);

  const combinedAlbums = useMemo(() => {
    const navidromeAlbums = navidromeResults?.albums || [];
    return [...navidromeAlbums, ...localResults.albums];
  }, [navidromeResults, localResults.albums]);

  const combinedSongs = useMemo(() => {
    const navidromeSongs = navidromeResults?.songs || [];
    return [...navidromeSongs, ...localResults.songs];
  }, [navidromeResults, localResults.songs]);

  const getCoverArtUrl = (coverArtId?: string) => {
    if (navidromeService && coverArtId) {
      return navidromeService.getCoverArtUrl(coverArtId);
    }
    return undefined;
  };

  return {
    albums: combinedAlbums,
    songs: combinedSongs,
    isLoading,
    getCoverArtUrl,
  };
};