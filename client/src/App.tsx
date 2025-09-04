import { Switch, Route, Redirect, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BottomNavigation } from "@/components/ui/bottom-navigation";
import { MiniPlayer } from "@/components/ui/mini-player";
import { useAuthStore } from "./stores/authStore";
import { useEffect } from "react";
import { navidromeService } from "./services/navidrome";
import { useSettingsStore } from "./stores/settingsStore";

import Login from "@/pages/login";
import Home from "@/pages/home";
import Album from "@/pages/album";
import Search from "@/pages/search";
import Playlists from "@/pages/playlists";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";

// Componente per la gestione delle route protette
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  // const { credentials } = useAuthStore();
  // return credentials ? <>{children}</> : <Redirect to="/login" />;
  return <>{children}</>;
}

function AppContent() {
  const [location] = useLocation();
  const { credentials } = useAuthStore();
  const { theme } = useSettingsStore();

  useEffect(() => {
    if (credentials) {
      navidromeService.setCredentials(credentials);
    }
  }, [credentials]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme]);

  // Hide bottom navigation on album and playlist detail pages
  const hideNavigation =
    location?.startsWith("/album/") || location?.startsWith("/playlist/");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="max-w-sm mx-auto relative">
        <Switch>
          <Route path="/login" component={Login} />
          <Route path="/">
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          </Route>
          <Route path="/album/:id">
            <ProtectedRoute>
              <Album />
            </ProtectedRoute>
          </Route>
          <Route path="/search">
            <ProtectedRoute>
              <Search />
            </ProtectedRoute>
          </Route>
          <Route path="/playlists">
            <ProtectedRoute>
              <Playlists />
            </ProtectedRoute>
          </Route>
          <Route path="/settings">
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          </Route>
          <Route component={NotFound} />
        </Switch>
      </main>

      <>
        <MiniPlayer />
        {!hideNavigation && <BottomNavigation />}
      </>
    </div>
  );
}

function App() {
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