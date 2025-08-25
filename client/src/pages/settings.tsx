import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { User, ChevronRight, FolderSync, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useAuthStore } from "@/stores/authStore";
import { usePlayerStore } from "@/stores/playerStore";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const [, setLocation] = useLocation();
  const { credentials, logout } = useAuthStore();
  const { volume, setVolume } = usePlayerStore();
  const { toast } = useToast();
  
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
    <div className="min-h-screen bg-dark-bg text-dark-text-primary pb-32">
      <div className="max-w-sm mx-auto">
        {/* Header */}
        <div className="px-4 py-6">
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>

        {/* Profile Section */}
        <div className="px-4 mb-8">
          <Card className="bg-dark-surface border-dark-border">
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-spotify-green rounded-full flex items-center justify-center">
                  <User className="text-dark-bg text-xl" />
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
            <h2 className="text-lg font-semibold mb-4 text-dark-text-primary">Playback</h2>
            <Card className="bg-dark-surface border-dark-border">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-dark-text-primary">Crossfade</p>
                    <p className="text-sm text-dark-text-secondary">Smooth transitions between songs</p>
                  </div>
                  <Switch
                    checked={crossfade}
                    onCheckedChange={setCrossfade}
                  />
                </div>
                
                <Separator className="bg-dark-border" />
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-dark-text-primary">Normalize volume</p>
                    <p className="text-sm text-dark-text-secondary">Keep consistent volume levels</p>
                  </div>
                  <Switch
                    checked={normalizeVolume}
                    onCheckedChange={setNormalizeVolume}
                  />
                </div>
                
                <Separator className="bg-dark-border" />
                
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-medium text-dark-text-primary">Volume</p>
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
            <h2 className="text-lg font-semibold mb-4 text-dark-text-primary">Audio Quality</h2>
            <Card className="bg-dark-surface border-dark-border">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between cursor-pointer hover:bg-dark-elevated -m-2 p-2 rounded-lg transition-colors">
                  <div>
                    <p className="font-medium text-dark-text-primary">Streaming quality</p>
                    <p className="text-sm text-dark-text-secondary">High (320 kbps)</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-dark-text-secondary" />
                </div>
                
                <Separator className="bg-dark-border" />
                
                <div className="flex items-center justify-between cursor-pointer hover:bg-dark-elevated -m-2 p-2 rounded-lg transition-colors">
                  <div>
                    <p className="font-medium text-dark-text-primary">Download quality</p>
                    <p className="text-sm text-dark-text-secondary">Very High (FLAC)</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-dark-text-secondary" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Server Settings */}
          <div>
            <h2 className="text-lg font-semibold mb-4 text-dark-text-primary">Server</h2>
            <Card className="bg-dark-surface border-dark-border">
              <CardContent className="p-4 space-y-4">
                <div
                  className="flex items-center justify-between cursor-pointer hover:bg-dark-elevated -m-2 p-2 rounded-lg transition-colors"
                  onClick={() => setLocation("/login")}
                >
                  <div>
                    <p className="font-medium text-dark-text-primary">Change server</p>
                    <p className="text-sm text-dark-text-secondary">Connect to a different server</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-dark-text-secondary" />
                </div>
                
                <Separator className="bg-dark-border" />
                
                <div
                  className="flex items-center justify-between cursor-pointer hover:bg-dark-elevated -m-2 p-2 rounded-lg transition-colors"
                  onClick={handleSync}
                >
                  <div>
                    <p className="font-medium text-dark-text-primary">FolderSync library</p>
                    <p className="text-sm text-dark-text-secondary">Update your music collection</p>
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
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #1DB954;
          cursor: pointer;
        }
        
        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #1DB954;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
}
