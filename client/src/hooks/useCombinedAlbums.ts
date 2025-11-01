import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { navidrome } from "@/services/navidrome";
import { useSettingsStore } from "@/stores/settingsStore";
import { useLocalFilesStore } from "@/stores/localFilesStore";
import { Album, Song } from "@/types/types";

export const useCombinedAlbums = () => {
  const { dataSource } = useSettingsStore();
  const { files: localSongs } = useLocalFilesStore();

  const { data: navidromeAlbums, isLoading: isLoadingNavidrome } = useQuery({
    queryKey: ["newestAlbums"],
    queryFn: () => navidrome.getNewestAlbums(),
    enabled: dataSource === "navidrome" || dataSource === "both",
  });

  const localAlbums = useMemo(() => {
    if (dataSource !== "local" && dataSource !== "both") return [];

    const albumMap = new Map<string, Song[]>();

    localSongs.forEach((song) => {
      const albumName = song.album || "Unknown Album";
      if (!albumMap.has(albumName)) {
        albumMap.set(albumName, []);
      }
      albumMap.get(albumName)!.push(song);
    });

    const albums: Album[] = [];
    albumMap.forEach((songs, albumName) => {
      const firstSong = songs[0];
      const artistName = firstSong.artist || "Unknown Artist";
      albums.push({
        id: `local-album-${albumName}-${artistName}`, // ID più robusto
        name: albumName,
        artist: artistName,
        coverArt: firstSong.coverArt || "",
        songCount: songs.length,
        year: firstSong.year,
      });
    });

    return albums;
  }, [localSongs, dataSource]);

  const allAlbums = useMemo(
    () =>
      [...(navidromeAlbums || []), ...localAlbums].sort(
        (a, b) => (b.year || 0) - (a.year || 0)
      ),
    [navidromeAlbums, localAlbums]
  );

  const isLoading =
    isLoadingNavidrome && (dataSource === "navidrome" || dataSource === "both");

  return { albums: allAlbums, isLoading };
};