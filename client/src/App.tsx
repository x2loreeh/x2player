import { Switch, Route, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import i18n from "@/i18n"; // Import i18n

import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";

import { useSettingsStore } from "@/stores/settingsStore";
import { usePlayerStore } from "@/stores/playerStore";
import { useConfigStore } from "@/stores/configStore";

import Home from "@/pages/home";
import Album from "@/pages/album";
import Search from "@/pages/search";
import Playlists from "@/pages/playlists";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";
import ArtistPage from "@/pages/artist";
import { MiniPlayer } from "@/components/ui/mini-player";
import { BottomNavigation } from "@/components/ui/bottom-navigation";
import { Welcome } from "@/pages/Welcome";

const queryClient = new QueryClient();

function AppContent() {
  const [location] = useLocation();
  const { theme } = useSettingsStore();
  const { currentTrack } = usePlayerStore();

  const isDesktop = useMediaQuery("(min-width: 768px)");
  const showPlayer = !!currentTrack;

  // RIMOSSO useEffect per il tema da qui

  return (
    <div className="relative min-h-screen">
      <main className={cn("pb-24", { "pt-16": isDesktop, "pb-40": showPlayer })}>
        <Switch location={location}>
          <Route path="/" component={Home} />
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

function App() {
  const { isFirstLaunch } = useConfigStore();
  const { theme, language } = useSettingsStore(); // Prendo tema e lingua dallo store

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

  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language]);


  if (isFirstLaunch) {
    return <Welcome />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AppContent />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;