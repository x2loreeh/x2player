import { Home, Search, Library, Settings } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useTranslation } from "@/hooks/useTranslation";
import { cn } from "@/lib/utils";
import { useScrollVisibility } from "@/hooks/useScrollVisibility";

export function BottomNavigation() {
  const [location] = useLocation();
  const t = useTranslation();
  const isVisible = useScrollVisibility(400);

  const navigation = [
    { name: "Home", i18nKey: "sidebar.home", href: "/", icon: Home },
    { name: "Search", i18nKey: "sidebar.search", href: "/search", icon: Search },
    { name: "Playlists", i18nKey: "sidebar.playlists", href: "/playlists", icon: Library },
    { name: "Settings", i18nKey: "sidebar.settings", href: "/settings", icon: Settings },
  ];

  return (
    <nav 
      className={cn(
        "fixed bottom-6 left-6 right-6 bg-background/80 backdrop-blur-2xl border border-border/50 rounded-full p-1.5 flex justify-around shadow-2xl z-50 transition-all duration-300 ease-in-out",
        isVisible ? "translate-y-0 opacity-100 scale-100" : "translate-y-20 opacity-0 scale-95 pointer-events-none"
      )}
    >
      {navigation.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          className={cn(
            "flex flex-col items-center text-[10px] w-16 pt-1.5 pb-1 transition-all duration-300 rounded-full",
            location === item.href
              ? "text-foreground bg-secondary/50 shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary/30"
          )}
        >
          <item.icon className="h-[20px] w-[20px]" />
          <span className="mt-1 font-medium">{item.name}</span>
        </Link>
      ))}
    </nav>
  );
}