import { useState, useEffect } from 'react';
import { Clock, MapPin, Navigation, CheckCircle } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { format, differenceInSeconds } from 'date-fns';
import { cn } from '@/lib/utils';

const TravelStatusCard = () => {
  const { isTravelModeOn, currentDestination, expectedArrivalTime, stopTravelMode, delayAcknowledged } = useApp();
  const { t } = useLanguage();
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  useEffect(() => {
    if (!isTravelModeOn || !expectedArrivalTime) return;

    const interval = setInterval(() => {
      const remaining = differenceInSeconds(expectedArrivalTime, new Date());
      setTimeRemaining(remaining);
    }, 1000);

    return () => clearInterval(interval);
  }, [isTravelModeOn, expectedArrivalTime]);

  const formatTime = (seconds: number) => {
    if (seconds < 0) return 'Overdue';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isTravelModeOn) {
    return (
      <div className="elevated-card p-4 opacity-60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
            <Navigation className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{t('activeTravelStatus')}</h3>
            <p className="text-xs text-muted-foreground">No active travel session</p>
          </div>
        </div>
      </div>
    );
  }

  const isLate = timeRemaining < 0 && !delayAcknowledged;

  return (
    <div className={cn(
      "elevated-card p-4 border-2 transition-colors duration-500",
      isLate ? "border-primary/30 bg-primary/5" : "border-safe/30 bg-safe/5"
    )}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center",
            isLate ? "bg-primary/20" : "bg-safe/20"
          )}>
            <Navigation className={cn("w-5 h-5", isLate ? "text-primary" : "text-safe")} />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{t('activeTravelStatus')}</h3>
            <div className="flex items-center gap-1">
              <span className={cn("status-dot", isLate ? "status-dot-active" : "bg-safe")} />
              <span className={cn("text-xs font-medium", isLate ? "text-safe" : "text-safe")}>Live Tracking</span>
            </div>
          </div>
        </div>
      </div>

      {/* Destination */}
      <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-xl mb-3">
        <MapPin className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium text-foreground">{currentDestination}</span>
      </div>

      {/* Time */}
      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{t('expectedArrival')}</span>
        </div>
        <span className="text-sm font-medium text-foreground">
          {expectedArrivalTime && format(expectedArrivalTime, 'h:mm a')}
        </span>
      </div>

      {/* Countdown */}
      <div className={cn(
        'text-center p-4 rounded-xl mb-4 transition-colors duration-500',
        isLate ? 'bg-sos/10 border border-sos/20' : 'bg-safe/10 border border-safe/20'
      )}>
        <p className="text-xs text-muted-foreground mb-1">{t('timeRemaining')}</p>
        <p className={cn(
          'text-3xl font-bold',
          isLate ? 'text-sos' : 'text-safe'
        )}>
          {formatTime(timeRemaining)}
        </p>
        {delayAcknowledged && timeRemaining < 0 && (
          <p className="text-[10px] text-orange-600 font-bold mt-1 uppercase">Delay Acknowledged</p>
        )}
      </div>

      {/* Reached Button */}
      <button
        onClick={() => stopTravelMode(true)}
        className="w-full py-3 rounded-xl bg-safe text-white font-semibold flex items-center justify-center gap-2 hover:bg-safe/90 transition-colors"
      >
        <CheckCircle className="w-5 h-5" />
        {t('reachedDestination')}
      </button>
    </div>
  );
};

export default TravelStatusCard;
