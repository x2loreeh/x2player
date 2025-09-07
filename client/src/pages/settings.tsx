import { useLocation, Link } from "wouter";
import { ChevronRight, FolderSync } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useAuthStore } from "@/stores/authStore";
import { useSettingsStore } from "@/stores/settingsStore";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useTranslation } from "@/hooks/useTranslation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMutation } from "@tanstack/react-query";
import { navidromeService } from "@/services/navidrome";

export default function SettingsPage() {
  const t = useTranslation();
  const [, navigate] = useLocation();
  const { user, logout } = useAuthStore();
  const {
    volume,
    setVolume,
    crossfade,
    setCrossfade,
    normalizeVolume,
    setNormalizeVolume,
    streamingQuality,
    setStreamingQuality,
    downloadQuality,
    setDownloadQuality,
    language,
    setLanguage,
    theme,
    setTheme,
  } = useSettingsStore();
  const { mutate: syncLibrary, isPending: isSyncing } = useMutation({
    mutationFn: () => navidromeService.scanLibrary(),
    onSuccess: () => {
      console.log("Library sync succeeded");
    },
    onError: () => {
      console.error("Library sync failed");
    },
  });

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value));
  };

  const handleLanguageChange = (value: string) => {
    setLanguage(value);
  };

  const handleThemeChange = (value: "light" | "dark" | "system") => {
    setTheme(value);
  };

  const handleLogout = () => {
    logout();
    console.log("Logout successful");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-48">
      <div className="max-w-2xl mx-auto p-4 md:p-6">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            {t("settings.title")}
          </h1>
        </header>

        <section id="user-profile" className="mb-8">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage src="" />
                  <AvatarFallback>
                    {user?.username?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-bold text-lg text-foreground">
                    {user?.username}
                  </h3>
                  <p className="text-muted-foreground text-sm"></p>
                </div>
              </div>
            </CardHeader>
            <CardFooter>
              <Button variant="outline" onClick={handleLogout}>
                {t("settings.logout")}
              </Button>
            </CardFooter>
          </Card>
        </section>

        <section id="playback" className="mb-8">
          <h2 className="text-lg font-semibold mb-4 text-foreground">
            {t("settings.playback")}
          </h2>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">
                    {t("settings.crossfade")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("settings.crossfadeDescription")}
                  </p>
                </div>
                <Switch
                  checked={crossfade > 0}
                  onCheckedChange={(checked) => setCrossfade(checked ? 5 : 0)}
                />
              </div>
              <Separator className="my-4" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">
                    {t("settings.normalizeVolume")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("settings.normalizeVolumeDescription")}
                  </p>
                </div>
                <Switch
                  checked={normalizeVolume}
                  onCheckedChange={setNormalizeVolume}
                />
              </div>
              <Separator className="my-4" />
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <p className="font-medium text-foreground">
                    {t("settings.volume")}
                  </p>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(volume * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
            </CardContent>
          </Card>
        </section>

        <section id="audio-quality" className="mb-8">
          <h2 className="text-lg font-semibold mb-4 text-foreground">
            {t("settings.audioQuality")}
          </h2>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">
                    {t("settings.streamingQuality")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("settings.streamingQualityDescription")}
                  </p>
                </div>
                <Select
                  value={streamingQuality}
                  onValueChange={
                    (value: "low" | "medium" | "high" | "lossless") =>
                      setStreamingQuality(value)
                  }
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select quality" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">{t("settings.low")}</SelectItem>
                    <SelectItem value="medium">
                      {t("settings.medium")}
                    </SelectItem>
                    <SelectItem value="high">{t("settings.high")}</SelectItem>
                    <SelectItem value="lossless">
                      {t("settings.lossless")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Separator className="my-4" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">
                    {t("settings.downloadQuality")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("settings.downloadQualityDescription")}
                  </p>
                </div>
                <Select
                  value={downloadQuality}
                  onValueChange={
                    (value: "low" | "medium" | "high" | "lossless") =>
                      setDownloadQuality(value)
                  }
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select quality" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">{t("settings.low")}</SelectItem>
                    <SelectItem value="medium">
                      {t("settings.medium")}
                    </SelectItem>
                    <SelectItem value="high">{t("settings.high")}</SelectItem>
                    <SelectItem value="lossless">
                      {t("settings.lossless")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </section>

        <section id="language" className="mb-8">
          <h2 className="text-lg font-semibold mb-4 text-foreground">
            {t("settings.language")}
          </h2>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">
                    {t("settings.language")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("settings.languageDescription")}
                  </p>
                </div>
                <Select value={language} onValueChange={handleLanguageChange}>
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
        </section>

        <section id="theme" className="mb-8">
          <h2 className="text-lg font-semibold mb-4 text-foreground">
            {t("settings.theme")}
          </h2>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">
                    {t("settings.theme")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("settings.themeDescription")}
                  </p>
                </div>
                <Select
                  value={theme}
                  onValueChange={(value) =>
                    handleThemeChange(value as "light" | "dark" | "system")
                  }
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">{t("settings.light")}</SelectItem>
                    <SelectItem value="dark">{t("settings.dark")}</SelectItem>
                    <SelectItem value="system">
                      {t("settings.system")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </section>

        <section id="server">
          <h2 className="text-lg font-semibold mb-4 text-foreground">
            {t("settings.server")}
          </h2>
          <Card>
            <CardContent className="pt-6">
              <Link to="/server-select">
                <div className="flex items-center justify-between cursor-pointer hover:bg-accent -m-2 p-2 rounded-lg transition-colors">
                  <div>
                    <p className="font-medium text-foreground">
                      {t("settings.changeServer")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t("settings.changeServerDescription")}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </Link>
              <Separator className="my-2" />
              <div
                className="flex items-center justify-between cursor-pointer hover:bg-accent -m-2 p-2 rounded-lg transition-colors"
                onClick={() => !isSyncing && syncLibrary()}
              >
                <div>
                  <p className="font-medium text-foreground">
                    {t("settings.syncLibrary")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("settings.syncLibraryDescription")}
                  </p>
                </div>
                {isSyncing ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <FolderSync className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}