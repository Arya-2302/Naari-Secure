import { Globe } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

const LanguageSwitch = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-2 bg-muted/50 rounded-full p-1">
      <Globe className="w-4 h-4 ml-2 text-muted-foreground" />
      <button
        onClick={() => setLanguage('en')}
        className={cn(
          'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
          language === 'en'
            ? 'bg-card text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        EN
      </button>
      <button
        onClick={() => setLanguage('hi')}
        className={cn(
          'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
          language === 'hi'
            ? 'bg-card text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        हि
      </button>
    </div>
  );
};

export default LanguageSwitch;
