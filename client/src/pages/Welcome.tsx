import { Button } from "@/components/ui/button";
import { useConfigStore } from "@/stores/configStore";
import { useTranslation } from "react-i18next";
import { Server, Folder } from "lucide-react";
import { useLocation } from "wouter";

export function Welcome() {
  const { setDataSource } = useConfigStore();
  const { t } = useTranslation();
  const [, setLocation] = useLocation();

  const handleNavidrome = () => {
    setDataSource("navidrome");
    setLocation("/login");
  };

  const handleLocalFiles = () => {
    setDataSource("local");
    setLocation("/local-files");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 text-center">
      <div className="max-w-md w-full">
        <h1 className="text-4xl font-bold mb-2 text-foreground">
          {t("welcome.title")}
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          {t("welcome.subtitle")}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Button
            onClick={handleNavidrome}
            className="h-auto p-6 text-lg"
            variant="outline"
          >
            <div className="flex flex-col items-center gap-2">
              <Server size={128} className="mb-2" />
              <span>{t("welcome.navidromeButton")}</span>
            </div>
          </Button>
          <Button
            onClick={handleLocalFiles}
            className="h-auto p-6 text-lg"
            variant="outline"
          >
            <div className="flex flex-col items-center gap-2">
              <Folder size={128} className="mb-2" />
              <span>{t("welcome.localFilesButton")}</span>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
}