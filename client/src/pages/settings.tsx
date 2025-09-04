import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { User, ChevronRight, FolderSync, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useAuthStore } from "@/stores/authStore";
import { usePlayerStore } from "@/stores/playerStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Settings() {
  const [, setLocation] = useLocation();
  const { credentials, logout } = useAuthStore();
  const { volume, setVolume } = usePlayerStore();
  const {
    theme,
    setTheme,
    language,
    setLanguage,
    streamingQuality,
    setStreamingQuality,
    downloadQuality,
    setDownloadQuality,
  } = useSettingsStore();
  const { toast } = useToast();
  const { t, i18n } = useTranslation();

  const [crossfade, setCrossfade] = useState<boolean>(() => {
    const savedCrossfade = localStorage.getItem('settings_crossfade');
    return savedCrossfade === 'true';
  });
  const [normalizeVolume, setNormalizeVolume] = useState<boolean>(() => {
    const savedNormalizeVolume = localStorage.getItem('settings_normalizeVolume');
    return savedNormalizeVolume !== 'false'; // Default to true if not set
  });

  useEffect(() => {
    localStorage.setItem('settings_crossfade', String(crossfade));
  }, [crossfade]);

  useEffect(() => {
    localStorage.setItem('settings_normalizeVolume', String(normalizeVolume));
  }, [normalizeVolume]);

  const handleLanguageChange = (lang: string) => {
    if (lang) {
      i18n.changeLanguage(lang);
      setLanguage(lang);
    }
  };

  const handleThemeChange = (theme: "light" | "dark" | "system") => {
    if (theme) {
      setTheme(theme);
    }
  };

  const handleLogout = () => {
    logout();
    toast({
      title: "Signed out",
      description: "You have been signed out successfully.",
    });
    setLocation("/login");
  };

  const handleSync = () => {
    toast({
      title: "Library sync started",
      description: "Your music library is being synced in the background.",
    });
  };

  return (
    <div className="min-h-screen bg-dark-bg text-dark-text-primary pb-48">
      <div className="max-w-sm mx-auto">
        {/* Header */}
        <div className="px-4 py-6">
          <h1 className="text-2xl font-bold">{t('settings.title')}</h1>
        </div>

        {/* Profile Section */}
        <div className="px-4 mb-8">
          <Card className="bg-dark-surface border-dark-border">
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center">
                  <User className="text-white h-8 w-8" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-dark-text-primary">
                    {credentials?.username || "User"}
                  </h3>
                  <p className="text-dark-text-secondary text-sm">
                    {credentials?.serverUrl?.replace(/^https?:\/\//, '') || "No server"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="px-4 space-y-8">
          {/* Playback Settings */}
          <div>
            <h2 className="text-lg font-semibold mb-4 text-dark-text-primary">{t('settings.playback')}</h2>
            <Card className="bg-dark-surface border-dark-border">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-dark-text-primary">{t('settings.crossfade')}</p>
                    <p className="text-sm text-dark-text-secondary">{t('settings.crossfadeDescription')}</p>
                  </div>
                  <Switch
                    checked={crossfade}
                    onCheckedChange={setCrossfade}
                  />
                </div>
                
                <Separator className="bg-dark-border" />
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-dark-text-primary">{t('settings.normalizeVolume')}</p>
                    <p className="text-sm text-dark-text-secondary">{t('settings.normalizeVolumeDescription')}</p>
                  </div>
                  <Switch
                    checked={normalizeVolume}
                    onCheckedChange={setNormalizeVolume}
                  />
                </div>
                
                <Separator className="bg-dark-border" />
                
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-medium text-dark-text-primary">{t('settings.volume')}</p>
                    <span className="text-sm text-dark-text-secondary">
                      {Math.round(volume * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-full h-2 bg-dark-border rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Audio Quality */}
          <div>
            <h2 className="text-lg font-semibold mb-4 text-dark-text-primary">{t('settings.audioQuality')}</h2>
            <Card className="bg-dark-surface border-dark-border">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-dark-text-primary">{t('settings.streamingQuality')}</p>
                    <p className="text-sm text-dark-text-secondary">{t('settings.streamingQualityDescription')}</p>
                  </div>
                  <Select value={streamingQuality} onValueChange={setStreamingQuality}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select quality" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="lossless">Lossless</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Separator className="bg-dark-border" />
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-dark-text-primary">{t('settings.downloadQuality')}</p>
                    <p className="text-sm text-dark-text-secondary">{t('settings.downloadQualityDescription')}</p>
                  </div>
                  <Select value={downloadQuality} onValueChange={setDownloadQuality}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select quality" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="lossless">Lossless</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Language Settings */}
          <div>
            <h2 className="text-lg font-semibold mb-4 text-dark-text-primary">{t('settings.language')}</h2>
            <Card className="bg-dark-surface border-dark-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-dark-text-primary">{t('settings.language')}</p>
                    <p className="text-sm text-dark-text-secondary">{t('settings.languageDescription')}</p>
                  </div>
                  <Select value={i18n.language} onValueChange={handleLanguageChange}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="it">Italiano</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Theme Settings */}
          <div>
            <h2 className="text-lg font-semibold mb-4 text-dark-text-primary">{t('settings.theme')}</h2>
            <Card className="bg-dark-surface border-dark-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-dark-text-primary">{t('settings.theme')}</p>
                    <p className="text-sm text-dark-text-secondary">{t('settings.themeDescription')}</p>
                  </div>
                  <Select value={theme} onValueChange={handleThemeChange}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Server Settings */}
          <div>
            <h2 className="text-lg font-semibold mb-4 text-dark-text-primary">{t('settings.server')}</h2>
            <Card className="bg-dark-surface border-dark-border">
              <CardContent className="p-4 space-y-4">
                <div
                  className="flex items-center justify-between cursor-pointer hover:bg-dark-elevated -m-2 p-2 rounded-lg transition-colors"
                  onClick={() => setLocation("/login")}
                >
                  <div>
                    <p className="font-medium text-dark-text-primary">{t('settings.changeServer')}</p>
                    <p className="text-sm text-dark-text-secondary">{t('settings.changeServerDescription')}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-dark-text-secondary" />
                </div>
                
                <Separator className="bg-dark-border" />
                
                <div
                  className="flex items-center justify-between cursor-pointer hover:bg-dark-elevated -m-2 p-2 rounded-lg transition-colors"
                  onClick={handleSync}
                >
                  <div>
                    <p className="font-medium text-dark-text-primary">{t('settings.syncLibrary')}</p>
                    <p className="text-sm text-dark-text-secondary">{t('settings.syncLibraryDescription')}</p>
                  </div>
                  <FolderSync className="h-4 w-4 text-dark-text-secondary" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Account Actions */}
          <div>
            <Button
              onClick={handleLogout}
              variant="destructive"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold"
            >
              <LogOut className="h-4 w-4 mr-2" />
              {t('settings.signOut')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}