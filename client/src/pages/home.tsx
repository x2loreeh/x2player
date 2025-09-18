import React from "react";
import { useQuery } from "@tanstack/react-query";
import { navidrome } from "../services/navidrome";
import { AlbumCard } from "../components/ui/album-card";
import { useTranslation } from "react-i18next";
import { useSettingsStore } from "../stores/settingsStore";

const Home: React.FC = () => {
  const { t } = useTranslation();
  const { dataSource } = useSettingsStore();

  const { data: albums, isLoading } = useQuery({
    queryKey: ["newestAlbums"],
    queryFn: () => navidrome.getNewestAlbums(),
    enabled: dataSource === "navidrome",
  });

  if (dataSource === "local") {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">{t("home.title")}</h1>
        <p>{t("home.local_files_not_implemented")}</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">{t("home.recentlyAdded")}</h1>
      {isLoading && <p>Loading...</p>}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {albums?.map((album) => (
          <AlbumCard key={album.id} album={album} />
        ))}
      </div>
    </div>
  );
};

export default Home;