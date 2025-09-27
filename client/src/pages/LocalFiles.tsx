import React, { useRef, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useSettingsStore } from "@/stores/settingsStore";
import { useLocalFilesStore } from "@/stores/localFilesStore";
import { usePlayerStore } from "@/stores/playerStore";
import { Capacitor } from "@capacitor/core";
import { FilePicker, PickedFile } from "@capawesome/capacitor-file-picker";
import { Song } from "@/types/types";
import jsmediatags from "jsmediatags";
import { Clock, Music } from "lucide-react";

// Funzione helper per convertire dati base64 in un Blob
const b64toBlob = (b64Data: string, contentType = "", sliceSize = 512) => {
  const byteCharacters = atob(b64Data);
  const byteArrays = [];
  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }
  return new Blob(byteArrays, { type: contentType });
};

const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

export function LocalFiles() {
  const { files, setFiles } = useLocalFilesStore();
  const { setDataSource } = useSettingsStore();
  const { playTrack, clearQueue } = usePlayerStore();
  const [, setLocation] = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  const processFiles = async (fileList: (File | PickedFile)[]) => {
    setIsLoading(true);
    const songs: Song[] = [];

    for (const file of fileList) {
      const fileObject =
        file instanceof File
          ? file
          : new File([b64toBlob(file.data!, file.mimeType)], file.name || "unknown", {
              type: file.mimeType,
            });

      try {
        const tags = await new Promise<any>((resolve, reject) => {
          jsmediatags.read(fileObject, {
            onSuccess: (tag) => resolve(tag),
            onError: (error) => reject(error),
          });
        });

        const { title, artist, album, picture } = tags.tags;
        let coverArt: string | null = null;
        if (picture) {
          const { data, format } = picture;
          const base64String = data.reduce(
            (acc: string, byte: number) => acc + String.fromCharCode(byte),
            ""
          );
          coverArt = `data:${format};base64,${window.btoa(base64String)}`;
        }

        // Usiamo l'URL del blob per la riproduzione
        const url = URL.createObjectURL(fileObject);

        songs.push({
          id: fileObject.name + fileObject.size, // ID univoco
          title: title || fileObject.name.replace(/\.[^/.]+$/, ""),
          artist: artist || "Unknown Artist",
          album: album || "Unknown Album",
          coverArt,
          path: url, // Usiamo il path per l'URL del blob
          duration: 0, // La durata verrà gestita dal player
          // Aggiungi qui altri campi del tipo Song se necessario
          parent: "", isDir: false, track: 0, year: 0, genre: "", size: fileObject.size,
          contentType: fileObject.type, suffix: "", bitRate: 0, playCount: 0,
          created: "", albumId: "", artistId: "", type: "music",
        });
      } catch (error) {
        console.error("Error reading tags for", fileObject.name, error);
      }
    }

    if (songs.length > 0) {
      clearQueue();
      setFiles(songs);
      setDataSource("local");
    } else {
      alert("No compatible audio files with readable metadata found.");
    }
    setIsLoading(false);
  };

  const handleWebFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (!fileList || fileList.length === 0) return;
    await processFiles(Array.from(fileList));
  };

  const handleButtonClick = async () => {
    const platform = Capacitor.getPlatform();
    try {
      if (platform === "android" || platform === "ios") {
        const result = await FilePicker.pickFiles({
          readData: true,
          types: platform === "ios" ? ["public.audio"] : undefined,
        });
        if (result && result.files.length > 0) {
          await processFiles(result.files);
        }
      } else {
        fileInputRef.current?.click();
      }
    } catch (e) {
      console.error("Error during file selection:", e);
      if (e instanceof Error && e.message.toLowerCase().includes("cancelled")) {
        return;
      }
      alert(`An error occurred during selection: ${e instanceof Error ? e.message : String(e)}`);
    }
  };

  const handleTrackClick = (track: Song) => {
    playTrack(track, files);
    setLocation("/player");
  };

  const platform = Capacitor.getPlatform();
  const isWeb = platform === "web";

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <h2 className="text-2xl mb-4">Loading your music...</h2>
        <p>Please wait while we process your files.</p>
      </div>
    );
  }

  if (files.length > 0) {
    return (
      <div className="min-h-screen bg-background text-foreground pb-32">
        <div className="max-w-sm mx-auto px-4 py-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Your Local Files</h2>
            <Button variant="outline" onClick={() => setFiles([])}>Change</Button>
          </div>
          <div className="space-y-2">
            {files.map((track) => (
              <div
                key={track.id}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                onClick={() => handleTrackClick(track)}
              >
                {track.coverArt ? (
                  <img src={track.coverArt} alt={`${track.title} cover`} className="w-12 h-12 rounded object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded bg-muted flex items-center justify-center">
                    <Music className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate text-foreground">{track.title}</p>
                  <p className="text-muted-foreground text-xs truncate">{track.artist} • {track.album}</p>
                </div>
                {track.duration > 0 && (
                  <div className="flex items-center text-muted-foreground text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatDuration(track.duration)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h2 className="text-2xl mb-4">Access Local Files</h2>
      <p className="mb-8">
        {isWeb
          ? "Select your music folder to start listening."
          : "Select one or more music files to add to your library."}
      </p>
      <Button onClick={handleButtonClick}>
        {isWeb ? "Select Music Folder" : "Select Music Files"}
      </Button>
      {isWeb && (
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleWebFileSelect}
          className="hidden"
          multiple
          {...{ directory: "", webkitdirectory: "" }}
        />
      )}
    </div>
  );
}