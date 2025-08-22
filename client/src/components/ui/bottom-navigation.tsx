import { Home, Search, List, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Search", href: "/search", icon: Search },
  { name: "Playlists", href: "/playlists", icon: List },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function BottomNavigation() {
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 max-w-sm mx-auto">
      <div className="bg-white/10 backdrop-blur-xl border-t border-white/20 px-4 py-2 shadow-2xl">
        <div className="flex justify-around items-center">
        {navigation.map((item) => {
          const isActive = location === item.href;
          return (
            <a
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center space-y-0.5 py-1.5 px-3 text-xs transition-all duration-200",
                isActive
                  ? "text-white transform -translate-y-0.5"
                  : "text-white/70 hover:text-white hover:transform hover:-translate-y-0.5"
              )}
            >
              <item.icon className="h-4 w-4" />
              <span className="text-xs">{item.name}</span>
            </a>
          );
        })}
        </div>
      </div>
    </nav>
  );
}
