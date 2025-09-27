import { Album, Song } from "@/types/types";
import { usePlayerStore } from "@/stores/playerStore";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonSearchbar,
  IonSpinner,
  IonList,
  IonListHeader,
  IonLabel,
  SearchbarCustomEvent,
  IonItem,
  IonThumbnail,
} from "@ionic/react";
import { useTranslation } from "react-i18next";
import { useDebounce } from "use-debounce";
import { useSettingsStore } from "@/stores/settingsStore";
import { useLocalFilesStore } from "@/stores/localFilesStore";
import { useState, useMemo, useEffect } from "react";
import { NavidromeService } from "@/services/navidrome";
import { AlbumCard } from "@/components/ui/album-card";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/authStore";

// Componente SongItem definito in linea
const SongItem = ({
  song,
  isPlaying,
  onClick,
  coverArtUrl,
}: {
  song: Song;
  isPlaying: boolean;
  onClick: () => void;
  coverArtUrl?: string;
}) => {
  return (
    <IonItem onClick={onClick} button>
      <IonThumbnail slot="start">
        <img src={coverArtUrl} alt={song.title} />
      </IonThumbnail>
      <IonLabel>
        <h2>{song.title}</h2>
        <p>{song.artist}</p>
      </IonLabel>
      {isPlaying && <IonSpinner slot="end" />}
    </IonItem>
  );
};

const SearchPage = () => {
  const { t } = useTranslation();
  const [searchText, setSearchText] = useState("");
  const [debouncedSearchText] = useDebounce(searchText, 500);
  const { dataSource } = useSettingsStore();
  const credentials = useAuthStore((s) => s.credentials);
  const { files: localSongs } = useLocalFilesStore();
  const { isPlaying, currentTrack, playQueue, togglePlay } = usePlayerStore();
  const [navidromeService, setNavidromeService] = useState<NavidromeService>();

  useEffect(() => {
    if (credentials) {
      const service = new NavidromeService();
      service.setCredentials(credentials);
      setNavidromeService(service);
    }
  }, [credentials]);

  const shouldFetchNavidrome =
    dataSource === "navidrome" || dataSource === "both";

  const { data, isLoading } = useQuery({
    queryKey: ["search", debouncedSearchText],
    queryFn: () => navidromeService?.search(debouncedSearchText),
    enabled:
      shouldFetchNavidrome && !!debouncedSearchText && !!navidromeService,
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

    const albums: Album[] = [];
    const albumMap = new Map<string, Song[]>();

    filteredSongs.forEach((song) => {
      if (song.album) {
        if (!albumMap.has(song.album)) {
          albumMap.set(song.album, []);
        }
        albumMap.get(song.album)!.push(song);
      }
    });

    albumMap.forEach((songs, albumName) => {
      const firstSong = songs[0];
      albums.push({
        id: firstSong.album || albumName,
        name: albumName,
        artist: firstSong.artist || "Unknown Artist",
        coverArt: firstSong.coverArt || "",
        songCount: songs.length,
      });
    });

    return { albums, songs: filteredSongs };
  }, [debouncedSearchText, localSongs, dataSource]);

  const combinedAlbums = useMemo(() => {
    const navidromeAlbums = data?.albums || [];
    return [...navidromeAlbums, ...localResults.albums];
  }, [data, localResults.albums]);

  const combinedSongs = useMemo(() => {
    const navidromeSongs = data?.songs || [];
    return [...navidromeSongs, ...localResults.songs];
  }, [data, localResults.songs]);

  const handlePlay = (song: Song) => {
    if (currentTrack?.id === song.id) {
      togglePlay();
      return;
    }
    playQueue(combinedSongs, combinedSongs.findIndex((s) => s.id === song.id));
  };

  const getCoverArtUrl = (coverArtId?: string) => {
    if (navidromeService && coverArtId) {
      return navidromeService.getCoverArtUrl(coverArtId);
    }
    return undefined;
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{t("search.title")}</IonTitle>
        </IonToolbar>
        <IonToolbar>
          <IonSearchbar
            value={searchText}
            onIonInput={(e: SearchbarCustomEvent) =>
              setSearchText(e.detail.value!)
            }
            placeholder={t("search.placeholder")}
          ></IonSearchbar>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {isLoading && <IonSpinner />}
        {!isLoading && debouncedSearchText && (
          <IonList>
            {combinedAlbums.length > 0 && (
              <>
                <IonListHeader>
                  <IonLabel>{t("search.albums")}</IonLabel>
                </IonListHeader>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 p-2">
                  {combinedAlbums.map((album) => (
                    <AlbumCard
                      key={album.id}
                      album={{
                        ...album,
                        coverArt: getCoverArtUrl(album.coverArt) || album.coverArt,
                      }}
                      onClick={() => {
                        const albumSongs = combinedSongs.filter(
                          (s) => s.album === album.name
                        );
                        if (albumSongs.length > 0) {
                          playQueue(albumSongs, 0);
                        }
                      }}
                    />
                  ))}
                </div>
              </>
            )}
            {combinedSongs.length > 0 && (
              <>
                <IonListHeader>
                  <IonLabel>{t("search.songs")}</IonLabel>
                </IonListHeader>
                {combinedSongs.map((song) => (
                  <SongItem
                    key={song.id}
                    song={song}
                    isPlaying={isPlaying && currentTrack?.id === song.id}
                    onClick={() => handlePlay(song)}
                    coverArtUrl={getCoverArtUrl(song.coverArt)}
                  />
                ))}
              </>
            )}
          </IonList>
        )}
      </IonContent>
    </IonPage>
  );
};

export default SearchPage;