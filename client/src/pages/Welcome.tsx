import { useConfigStore } from '@/stores/configStore';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';

export function Welcome() {
  const { setDataSource } = useConfigStore();
  const t = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">{t('welcome.title')}</h1>
        <p className="text-lg text-muted-foreground mb-8">
          {t('welcome.subtitle')}
        </p>
      </div>
      <div className="flex gap-4">
        <Button onClick={() => setDataSource('navidrome')}>
          {t('welcome.navidromeButton')}
        </Button>
        <Button onClick={() => setDataSource('local')} disabled>
          {t('welcome.localFilesButton')}
        </Button>
      </div>
    </div>
  );
}