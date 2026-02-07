import { Battery, BatteryCharging, BatteryLow, BatteryWarning, Zap } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

const BatteryCard = () => {
  const { batteryLevel, isCharging, trackingInterval } = useApp();
  const { t } = useLanguage();

  const getBatteryIcon = () => {
    if (isCharging) return BatteryCharging;
    if (batteryLevel <= 15) return BatteryWarning;
    if (batteryLevel <= 30) return BatteryLow;
    return Battery;
  };

  const getBatteryColor = () => {
    if (batteryLevel <= 15) return 'text-sos';
    if (batteryLevel <= 30) return 'text-warning';
    return 'text-safe';
  };

  const getTrackingMode = () => {
    if (trackingInterval <= 5000) return 'SOS Mode';
    if (trackingInterval <= 10000) return t('normalTracking');
    if (trackingInterval <= 20000) return t('powerSaveTracking');
    return 'Minimal Tracking';
  };

  const BatteryIcon = getBatteryIcon();

  return (
    <div className="elevated-card p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center bg-muted', getBatteryColor())}>
          <BatteryIcon className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">{t('batteryTracking')}</h3>
          <p className="text-xs text-muted-foreground">{t('trackingMode')}</p>
        </div>
      </div>

      {/* Battery Bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-foreground">{t('batteryLevel')}</span>
          <span className={cn('text-sm font-bold', getBatteryColor())}>
            {batteryLevel}%
            {isCharging && <Zap className="w-3 h-3 inline ml-1" />}
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500',
              batteryLevel <= 15 ? 'bg-sos' : batteryLevel <= 30 ? 'bg-warning' : 'bg-safe'
            )}
            style={{ width: `${batteryLevel}%` }}
          />
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
        <span className="text-xs text-muted-foreground">{t('status')}</span>
        <span className="text-xs font-medium text-foreground">{getTrackingMode()}</span>
      </div>

      {/* Low Battery Warning */}
      {batteryLevel <= 15 && (
        <div className="mt-3 p-2 bg-sos/10 rounded-lg border border-sos/20">
          <p className="text-xs text-sos font-medium">⚠️ {t('lowBatteryWarning')}</p>
        </div>
      )}
    </div>
  );
};

export default BatteryCard;
