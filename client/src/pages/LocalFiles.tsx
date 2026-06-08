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
import { makeLocalAlbumId, normalizeLocalArtist } from "@/lib/localMusic";

const b64toBlob = (b64Data: string, contentType = "", sliceSize = 512) => {
  const byteCharacters = atob(b64Data);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);
    const byteNumbers = new Array(slice.length);

    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    byteArrays.push(new Uint8Array(byteNumbers));
  }

  return new Blob(byteArrays, { type: contentType });
};

const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

const getAudioDuration = (url: string) =>
  new Promise<number>((resolve) => {
    const audio = document.createElement("audio");
    let settled = false;

    const cleanup = () => {
      audio.removeAttribute("src");
      audio.load();
    };

    const finish = (duration: number) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(duration);
    };

    audio.preload = "metadata";
    audio.src = url;
    audio.onloadedmetadata = () => {
      const duration = Number.isFinite(audio.duration)
        ? Math.round(audio.duration)
        : 0;

      finish(duration);
    };
    audio.onerror = () => finish(0);
    window.setTimeout(() => finish(0), 8000);
  });

const readAudioTags = (file: File) =>
  new Promise<any>((resolve) => {
    jsmediatags.read(file, {
      onSuccess: (tag) => resolve(tag.tags || {}),
      onError: () => resolve({}),
    });
  });

const parseTrackNumber = (track: unknown) => {
  const value = Array.isArray(track) ? track[0] : track;
  const firstPart = String(value || "0").split("/")[0];
  return parseInt(firstPart, 10) || 0;
};

const parseYear = (year: unknown) => {
  const match = String(year || "").match(/\d{4}/);
  return match ? parseInt(match[0], 10) : 0;
};

const getTagValue = (tags: Record<string, any>, keys: string[]) => {
  for (const key of keys) {
    const value = tags[key];

    if (Array.isArray(value)) {
      const first = value.find(Boolean);
      if (first) return String(first).trim();
    }

    if (value && typeof value === "object" && "data" in value) {
      return String(value.data || "").trim();
    }

    if (value) {
      return String(value).trim();
    }
  }

  return "";
};

const getFileBaseName = (fileName: string) => fileName.replace(/\.[^/.]+$/, "");

const getDirectoryAlbumName = (file: File | PickedFile) => {
  const path =
    file instanceof File
      ? file.webkitRelativePath
      : "path" in file && typeof file.path === "string"
        ? file.path
        : "";
  const parts = path.split(/[\\/]/).filter(Boolean);

  return parts.length > 1 ? parts[parts.length - 2] : "";
};

export function LocalFiles() {
  const { files, setFiles } = useLocalFilesStore();
  const { enableDataSource } = useSettingsStore();
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
          : new File(
              [b64toBlob(file.data!, file.mimeType)],
              file.name || "unknown",
              { type: file.mimeType }
            );

      try {
        const tags = await readAudioTags(fileObject);
        const title = getTagValue(tags, ["title", "TIT2"]);
        const artist = getTagValue(tags, ["artist", "TPE1"]);
        const albumArtist = getTagValue(tags, [
          "albumartist",
          "albumArtist",
          "TPE2",
        ]);
        const album = getTagValue(tags, ["album", "TALB"]);
        const track = getTagValue(tags, ["track", "TRCK"]);
        const year = getTagValue(tags, ["year", "date", "TYER", "TDRC"]);
        const genre = getTagValue(tags, ["genre", "TCON"]);
        const { picture } = tags;
        const url = URL.createObjectURL(fileObject);
        const duration = await getAudioDuration(url);
        let coverArt: string | null = null;
        const artistName = normalizeLocalArtist(artist || albumArtist);
        const albumArtistName = normalizeLocalArtist(albumArtist || artistName);
        const albumName =
          album || getDirectoryAlbumName(file) || "Unknown Album";
        const albumId = makeLocalAlbumId(albumName, albumArtistName);

        if (picture) {
          const { data, format } = picture;
          const base64String = data.reduce(
            (acc: string, byte: number) => acc + String.fromCharCode(byte),
            ""
          );
          coverArt = `data:${format};base64,${window.btoa(base64String)}`;
        }

        songs.push({
          id: `${fileObject.name}-${fileObject.size}`,
          title: title || getFileBaseName(fileObject.name),
          artist: artistName,
          album: albumName,
          coverArt,
          path: url,
          duration,
          parent: "",
          isDir: false,
          track: parseTrackNumber(track),
          year: parseYear(year),
          genre: genre || "",
          size: fileObject.size,
          contentType: fileObject.type,
          suffix: "",
          bitRate: 0,
          playCount: 0,
          created: "",
          albumId,
          artistId: albumArtistName,
          type: "music",
        });
      } catch (error) {
        console.error("Error processing file", fileObject.name, error);
      }
    }

    if (songs.length > 0) {
      clearQueue();
      setFiles(songs);
      enableDataSource("local");
    } else {
      alert("No compatible audio files found.");
    }

    setIsLoading(false);
  };

  const handleWebFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
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

      alert(
        `An error occurred during selection: ${
          e instanceof Error ? e.message : String(e)
        }`
      );
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
            <Button variant="outline" onClick={() => setFiles([])}>
              Change
            </Button>
          </div>
          <div className="space-y-2">
            {files.map((track) => (
              <div
                key={track.id}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                onClick={() => handleTrackClick(track)}
              >
                {track.coverArt ? (
                  <img
                    src={track.coverArt}
                    alt={`${track.title} cover`}
                    className="w-12 h-12 rounded object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded bg-muted flex items-center justify-center">
                    <Music className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate text-foreground">
                    {track.title}
                  </p>
                  <p className="text-muted-foreground text-xs truncate">
                    {track.artist} - {track.album}
                  </p>
                </div>
                {track.duration != null && track.duration > 0 && (
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
