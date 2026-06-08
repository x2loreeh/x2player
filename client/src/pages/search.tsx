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
} from "@ionic/react";
import { useTranslation } from "react-i18next";
import { useDebounce } from "use-debounce";
import { useState, useCallback } from "react";
import { AlbumCard } from "@/components/ui/album-card";
import { SongItem } from "@/components/ui/song-item";
import { useCombinedSearch } from "@/hooks/useCombinedSearch";
import { useNavigate } from "react-router-dom";

const SearchPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
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
      navigate(`/album/${album.id}`);
    }
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
              </>
            )}
            {combinedSongs.length > 0 && (
              <>
                <IonListHeader>
                  <IonLabel>{t("search.songs")}</IonLabel>
                </IonListHeader>
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
              </>
            )}
          </IonList>
        )}
      </IonContent>
    </IonPage>
  );
};

export default SearchPage;