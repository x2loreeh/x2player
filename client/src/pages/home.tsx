import React, { useCallback } from "react";
import { useLocation } from "wouter";
import { AlbumCard } from "@/components/ui/album-card";
import { useTranslation } from "react-i18next";
import { Album } from "@/types/types";
import { useCombinedAlbums } from "@/hooks/useCombinedAlbums";

const Home: React.FC = () => {
  const { t } = useTranslation();
  const { albums, isLoading } = useCombinedAlbums();
  const [, setLocation] = useLocation();

  const handleAlbumClick = useCallback(
    (album: Album) => {
      setLocation(`/album/${album.id}`);
    },
    [setLocation]
  );

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">{t("home.recentlyAdded")}</h1>
      {isLoading && <p>{t("home.loading", "Loading...")}</p>}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {albums.map((album) => (
          <AlbumCard
            key={album.id}
            album={album}
            onClick={() => handleAlbumClick(album)}
          />
        ))}
      </div>
    </div>
  );
};

export default Home;
