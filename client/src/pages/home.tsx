import React from "react";
import { useQuery } from "@tanstack/react-query";
import { navidrome } from "../services/navidrome";
import { AlbumCard } from "../components/ui/album-card";
import { useTranslation } from "react-i18next";
import { useSettingsStore } from "../stores/settingsStore";
import { useLocalFilesStore } from "@/stores/localFilesStore";
import { Album, Song } from "@/types/types";

const Home: React.FC = () => {
  const { t } = useTranslation();
  const { dataSource } = useSettingsStore();
  const { files: localSongs } = useLocalFilesStore();

  const { data: navidromeAlbums, isLoading: isLoadingNavidrome } = useQuery({
    queryKey: ["newestAlbums"],
    queryFn: () => navidrome.getNewestAlbums(),
    enabled: dataSource === "navidrome" || dataSource === "both",
  });

  const localAlbums = React.useMemo(() => {
    if (dataSource !== "local" && dataSource !== "both") return [];

    const albumsMap: { [key: string]: Album } = {};

    localSongs.forEach((song: Song) => {
      const albumName = song.album || "Unknown Album";
      if (!albumsMap[albumName]) {
        albumsMap[albumName] = {
          id: albumName,
          name: albumName,
          artist: song.artist || "Unknown Artist",
          coverArt: song.coverArt || "",
          songCount: 0,
        };
      }
      albumsMap[albumName].songCount++;
    });

    return Object.values(albumsMap);
  }, [localSongs, dataSource]);

  const allAlbums = [...(navidromeAlbums || []), ...localAlbums];
  const isLoading = isLoadingNavidrome && (dataSource === "navidrome" || dataSource === "both");

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">{t("home.recentlyAdded")}</h1>
      {isLoading && <p>Loading...</p>}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {allAlbums.map((album) => (
          <AlbumCard key={album.id} album={album} />
        ))}
      </div>
    </div>
  );
};

export default Home;