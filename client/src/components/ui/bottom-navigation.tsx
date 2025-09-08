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
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-black border-t p-2 flex justify-around">
      {navigation.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          className={cn(
            "flex flex-col items-center text-xs w-20 pt-1 pb-0.5 transition-all duration-200",
            location === item.href
              ? "text-primary -translate-y-1"
              : "text-muted-foreground hover:text-primary"
          )}
        >
          <item.icon className="h-6 w-6" />
          <span className="mt-1">{item.name}</span>
        </Link>
      ))}
    </nav>
  );
}