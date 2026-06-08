import { Home, Search, Library, Settings } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useTranslation } from "@/hooks/useTranslation";
import { cn } from "@/lib/utils";

export function BottomNavigation() {
  const [location] = useLocation();
  const t = useTranslation();

  const navigation = [
    { name: "Home", i18nKey: "sidebar.home", href: "/", icon: Home },
    { name: "Search", i18nKey: "sidebar.search", href: "/search", icon: Search },
    { name: "Playlists", i18nKey: "sidebar.playlists", href: "/playlists", icon: Library },
    { name: "Settings", i18nKey: "sidebar.settings", href: "/settings", icon: Settings },
  ];

  return (
    <nav className="fixed bottom-6 left-4 right-4 bg-background/80 backdrop-blur-2xl border border-border/50 rounded-[32px] p-2 flex justify-around shadow-2xl z-50">
      {navigation.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          className={cn(
            "flex flex-col items-center text-xs w-20 pt-1.5 pb-1 transition-all duration-300 rounded-[24px]",
            location === item.href
              ? "text-foreground bg-secondary/50 shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary/30"
          )}
        >
          <item.icon className="h-[22px] w-[22px]" />
          <span className="mt-1.5 font-medium">{item.name}</span>
        </Link>
      ))}
    </nav>
  );
}