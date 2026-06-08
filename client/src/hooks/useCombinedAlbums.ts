import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { navidrome } from "@/services/navidrome";
import { useSettingsStore } from "@/stores/settingsStore";
import { useLocalFilesStore } from "@/stores/localFilesStore";
import { buildLocalAlbums } from "@/lib/localMusic";

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

    return buildLocalAlbums(localSongs);
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
