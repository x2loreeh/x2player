import { IonItem, IonThumbnail, IonLabel, IonSpinner } from "@ionic/react";
import { Song } from "@/types/types";

interface SongItemProps {
  song: Song;
  isPlaying: boolean;
  onClick: () => void;
  coverArtUrl?: string;
}

export const SongItem = ({
  song,
  isPlaying,
  onClick,
  coverArtUrl,
}: SongItemProps) => {
  return (
    <IonItem onClick={onClick} button>
      <IonThumbnail slot="start">
        <img src={coverArtUrl || ""} alt={song.title} />
      </IonThumbnail>
      <IonLabel>
        <h2>{song.title}</h2>
        <p>{song.artist}</p>
      </IonLabel>
      {isPlaying && <IonSpinner slot="end" />}
    </IonItem>
  );
};