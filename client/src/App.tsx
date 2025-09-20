import { useEffect } from "react";
import { Switch, Route, useLocation, Redirect } from "wouter";
import { Toaster } from "./components/ui/toaster";
import { BottomNavigation } from "./components/ui/bottom-navigation";
import { MiniPlayer } from "./components/ui/mini-player";
import { cn } from "./lib/utils";
import { useSettingsStore } from "./stores/settingsStore";
import { usePlayerStore } from "./stores/playerStore";
import { useQuery } from "@tanstack/react-query";
import { navidrome } from "./services/navidrome";
import { Loader2 } from "lucide-react";

import { Welcome } from "./pages/Welcome";
import Login from "./pages/login";
import Home from "./pages/home.tsx";
import Album from "./pages/album";
import ArtistPage from "./pages/artist";
import Search from "./pages/search";
import Playlists from "./pages/playlists";
import Settings from "./pages/settings";
import NotFound from "./pages/not-found";
import { LocalFiles } from "./pages/LocalFiles";

function App() {
  const { dataSource, navidromeCredentials, theme } = useSettingsStore();
  const { currentTrack } = usePlayerStore();
  const [location] = useLocation();

  useEffect(() => {
    if (dataSource === "navidrome" && navidromeCredentials) {
      navidrome.setCredentials(navidromeCredentials);
    }
  }, [dataSource, navidromeCredentials]);

  const { data: session, isLoading } = useQuery({
    queryKey: ["getSession", navidromeCredentials],
    queryFn: () => navidrome.checkAuth(),
    enabled: dataSource === "navidrome" && !!navidromeCredentials,
    retry: false,
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    let effectiveTheme = theme;
    if (theme === "system") {
      effectiveTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
    }

    root.classList.add(effectiveTheme);
  }, [theme]);

  if (!dataSource && location !== "/welcome") {
    return <Redirect to="/welcome" />;
  }

  if (dataSource === "navidrome") {
    if (isLoading) {
      return (
        <div className="flex h-full items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin" />
        </div>
      );
    }
    if ((!navidromeCredentials || !session) && location !== "/login") {
      return <Redirect to="/login" />;
    }
  }

  const isDesktop = window.matchMedia("(min-width: 768px)").matches;
  const showPlayer = !!currentTrack;

  return (
    <div className="relative min-h-screen">
      <Toaster />
      <main
        className={cn("pb-24", { "pt-16": isDesktop, "pb-40": showPlayer })}
      >
        <Switch>
          <Route path="/welcome" component={Welcome} />
          <Route path="/login" component={Login} />
          <Route path="/local-files" component={LocalFiles} />
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