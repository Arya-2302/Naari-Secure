import { CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const TravelHistoryCard = () => {
  const { travelSessions } = useApp();
  const { t } = useLanguage();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-safe" />;
      case 'active':
        return <Clock className="w-4 h-4 text-primary" />;
      case 'sos':
        return <AlertTriangle className="w-4 h-4 text-sos" />;
      default:
        return null;
    }
  };

  return (
    <div className="elevated-card p-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
          <Clock className="w-5 h-5 text-secondary-foreground" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">{t('travelHistory')}</h3>
          <p className="text-xs text-muted-foreground">{travelSessions.length} sessions</p>
        </div>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {travelSessions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No travel history yet
          </p>
        ) : (
          travelSessions.slice(0, 5).map((session) => (
            <div
              key={session.id}
              className={cn(
                'p-3 rounded-xl border',
                session.status === 'active'
                  ? 'bg-primary/5 border-primary/20'
                  : session.status === 'sos'
                  ? 'bg-sos/5 border-sos/20'
                  : 'bg-muted/30 border-border/50'
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-foreground">
                  {session.destination}
                </span>
                {getStatusIcon(session.status)}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{format(session.startTime, 'MMM dd, h:mm a')}</span>
                {session.endTime && (
                  <>
                    <span>→</span>
                    <span>{format(session.endTime, 'h:mm a')}</span>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TravelHistoryCard;
