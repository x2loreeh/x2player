import { useEffect, useState } from "react";
import { Switch, Route, Router, Redirect, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { BottomNavigation } from "@/components/ui/bottom-navigation";
import { MiniPlayer } from "@/components/ui/mini-player";
import { cn } from "@/lib/utils";
import { useSettingsStore } from "@/stores/settingsStore";
import { usePlayerStore } from "@/stores/playerStore";
import { useLocalFilesStore } from "@/stores/localFilesStore";
import type { Track } from "@shared/schema";
import jsmediatags from "jsmediatags";
import { Loader2 } from "lucide-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { Welcome } from "@/pages/Welcome";
import Login from "@/pages/login";
import { LocalFiles } from "@/pages/LocalFiles";
import Home from "@/pages/home";
import Album from "@/pages/album";
import ArtistPage from "@/pages/artist";
import Search from "@/pages/search";
import Playlists from "@/pages/playlists";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

const readTrackMetadata = (file: File): Promise<Track> => {
  return new Promise((resolve, reject) => {
    jsmediatags.read(file, {
      onSuccess: (tag) => {
        const tags = tag.tags;
        let coverUrl = "default-cover";

        if (tags.picture) {
          const { data, format } = tags.picture;
          const base64String = data.reduce(
            (acc, byte) => acc + String.fromCharCode(byte),
            ""
          );
          coverUrl = `data:${format};base64,${window.btoa(base64String)}`;
        }

        const objectUrl = URL.createObjectURL(file);
        const audio = new Audio(objectUrl);
        
        audio.addEventListener("loadedmetadata", () => {
          const trackData: Track = {
            id: `local-${file.name}-${Math.random()}`,
            title: tags.title || file.name.replace(/\.[^/.]+$/, ""),
            artist: tags.artist || "Unknown Artist",
            album: tags.album || "Unknown Album",
            year: tags.year ? parseInt(tags.year, 10) : null,
            genre: tags.genre || null,
            track: tags.track ? parseInt(tags.track.split('/')[0], 10) : null,
            coverArt: coverUrl,
            duration: audio.duration,
            path: objectUrl,
            albumId: `local-album-${tags.artist}-${tags.album}`,
          };
          resolve(trackData);
        });
        audio.addEventListener("error", (e) => {
          URL.revokeObjectURL(objectUrl);
          reject(new Error("Error loading audio metadata"));
        });
      },
      onError: (error) => {
        console.error("Could not read metadata for file:", file.name, error);
        const objectUrl = URL.createObjectURL(file);
        const audio = new Audio(objectUrl);
        audio.addEventListener("loadedmetadata", () => {
            resolve({
                id: `local-${file.name}-${Math.random()}`,
                title: file.name.replace(/\.[^/.]+$/, ""),
                artist: "Unknown Artist",
                album: "Unknown Album",
                year: null,
                genre: null,
                track: null,
                coverArt: "default-cover",
                duration: audio.duration,
                path: objectUrl,
                albumId: `local-album-unknown`,
            });
        });
         audio.addEventListener("error", (e) => {
            URL.revokeObjectURL(objectUrl);
            reject(new Error("Error loading audio metadata"));
        });
      },
    });
  });
};


function App() {
  const { dataSource } = useSettingsStore();
  const { queue, playQueue } = usePlayerStore();
  const { files } = useLocalFilesStore();
  const [location] = useLocation();
  const [isHydrating, setIsHydrating] = useState(true);
  const [isLoadingTracks, setIsLoadingTracks] = useState(false);

  useEffect(() => {
    const rehydrate = useLocalFilesStore.persist.rehydrate();
    if (rehydrate instanceof Promise) {
      rehydrate.then(() => setIsHydrating(false));
    } else {
      setIsHydrating(false);
    }
  }, []);

  useEffect(() => {
    if (isHydrating) return;

    const needsToLoadTracks = dataSource === "local" && files.length > 0 && queue.length === 0;

    if (needsToLoadTracks) {
      setIsLoadingTracks(true);
      Promise.all(files.map(readTrackMetadata))
        .then((tracks) => {
          if (tracks.length > 0) {
            playQueue(tracks);
          }
        })
        .catch((error) => {
          console.error("Error loading tracks from IndexedDB", error);
        })
        .finally(() => {
          setIsLoadingTracks(false);
        });
    }
  }, [dataSource, files, queue.length, playQueue, isHydrating]);

  if (isHydrating || isLoadingTracks) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 animate-spin mb-4" />
        <h2 className="text-2xl">Loading your music...</h2>
      </div>
    );
  }

  if (dataSource === "local" && files.length === 0 && location !== "/local-files") {
    return <Redirect to="/local-files" />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Switch>
          <Route path="/welcome">
          <Welcome />
        </Route>
        <Route path="/login">
          <Login />
        </Route>
        <Route path="/local-files">
          <LocalFiles />
        </Route>
        <Route path="*">
          {dataSource ? <AppContent /> : <Redirect to="/welcome" />}
        </Route>
      </Switch>
    </Router>
    </QueryClientProvider>
  );
}

function AppContent() {
  const [location] = useLocation();
  const { theme } = useSettingsStore();
  const { currentTrack } = usePlayerStore();

  const isDesktop = window.matchMedia("(min-width: 768px)").matches;
  const showPlayer = !!currentTrack;

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    let effectiveTheme = theme;
    if (theme === "system") {
      effectiveTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }

    root.classList.add(effectiveTheme);
  }, [theme]);

  return (
    <div className="relative min-h-screen">
      <Toaster />
      <main className={cn("pb-24", { "pt-16": isDesktop, "pb-40": showPlayer })}>
        <Switch location={location}>
          <Route path="/" component={Home} />
          <Route path="/home" component={Home} />
          <Route path="/album/:id" component={Album} />
          <Route path="/artist/:id" component={ArtistPage} />
          <Route path="/search" component={Search} />
          <Route path="/playlists/:id" component={Playlists} />
          <Route path="/playlists" component={Playlists} />
          <Route path="/settings" component={Settings} />
          <Route component={NotFound} />
        </Switch>
      </main>
      {showPlayer && <MiniPlayer />}
      <BottomNavigation />
    </div>
  );
}

export default App;