import { useConfigStore } from '@/stores/configStore';
import { Button } from '@/components/ui/button';

export function Welcome() {
  const { setDataSource } = useConfigStore();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Benvenuto in x2player</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Scegli come vuoi ascoltare la tua musica.
        </p>
      </div>
      <div className="flex gap-4">
        <Button onClick={() => setDataSource('navidrome')}>
          Usa un server Navidrome
        </Button>
        <Button onClick={() => setDataSource('local')} disabled>
          Usa file locali (Prossimamente)
        </Button>
      </div>
    </div>
  );
}