import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Music, Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { navidrome } from "@/services/navidrome";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

export default function Login() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    serverUrl: "",
    username: "",
    password: "",
  });
  
  const { login } = useAuthStore();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Clean up server URL
      let serverUrl = formData.serverUrl.trim();
      if (!serverUrl.startsWith('http://') && !serverUrl.startsWith('https://')) {
        serverUrl = 'https://' + serverUrl;
      }
      serverUrl = serverUrl.replace(/\/$/, ''); // Remove trailing slash

      const credentials = {
        serverUrl,
        username: formData.username,
        password: formData.password,
      };

      // Set credentials and test connection
      navidrome.setCredentials(credentials);
      const isConnected = await navidrome.ping();

      if (!isConnected) {
        throw new Error('Failed to connect to Navidrome server. Please check your credentials and server URL.');
      }

      // Save credentials and redirect
      login(credentials);
      toast({
        title: "Connected successfully",
        description: "Welcome to x2player!",
      });
      setLocation("/");
    } catch (error) {
      console.error('Login failed:', error);
      toast({
        title: "Connection failed",
        description: error instanceof Error ? error.message : "Please check your credentials and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-center px-6 py-8">
      <div className="max-w-sm mx-auto w-full">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
            <Music className="text-foreground text-4xl" />
          </div>
          <h1 className="text-3xl font-bold text-center mb-2 text-foreground">{t("login.title", "x2player")}</h1>
          <p className="text-muted-foreground">{t("login.subtitle")}</p>
        </div>

        <Card className="bg-secondary border-border">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="serverUrl" className="text-muted-foreground">
                  {t("login.serverUrl")}
                </Label>
                <Input
                  id="serverUrl"
                  type="text"
                  placeholder="https://navidrome.example.com"
                  value={formData.serverUrl}
                  onChange={handleInputChange('serverUrl')}
                  className="bg-secondary border-border text-foreground placeholder-dark-text-secondary focus:border-dark-text-secondary"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="username" className="text-muted-foreground">
                  {t("login.username")}
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder={t("login.username")}
                  value={formData.username}
                  onChange={handleInputChange('username')}
                  className="bg-secondary border-border text-foreground placeholder-dark-text-secondary focus:border-dark-text-secondary"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-muted-foreground">
                  {t("login.password")}
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={t("login.password")}
                  value={formData.password}
                  onChange={handleInputChange('password')}
                  className="bg-secondary border-border text-foreground placeholder-dark-text-secondary focus:border-dark-text-secondary"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-secondary text-foreground hover:bg-muted font-semibold"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("login.connecting")}
                  </>
                ) : (
                  t("login.connect")
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <div className="mt-8 text-center">
          <p className="text-center text-muted-foreground text-sm">
            {t("login.noServer")}{" "}
            <a href="https://www.navidrome.org/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground text-sm hover:underline">
              Navidrome
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}