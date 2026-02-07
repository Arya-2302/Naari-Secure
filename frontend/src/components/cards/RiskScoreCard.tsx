import { AlertCircle, Shield, TrendingUp } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';
import { calculateSafetyScore } from '@/utils/calculateSafetyScore';

const RiskScoreCard = () => {
  const { t } = useLanguage();
  const { batteryLevel, currentRisk, riskLevel } = useApp();

  // LIVE SAFETY SCORE CALCULATION
  const score = calculateSafetyScore({
    battery: batteryLevel,
    hour: new Date().getHours(),
    areaRisk: currentRisk
  });

  // COLOR LOGIC: Green > 80, Yellow 50-79, Red < 50
  const config = {
    color: score >= 80 ? "text-green-600" : score >= 50 ? "text-yellow-500" : "text-red-600",
    bg: score >= 80 ? "bg-green-50" : score >= 50 ? "bg-yellow-50" : "bg-red-50",
    border: score >= 80 ? "border-green-200" : score >= 50 ? "border-yellow-200" : "border-red-200",
    icon: score >= 80 ? Shield : AlertCircle
  };

  const RiskIcon = config.icon;

  return (
    <div className="elevated-card p-4">
      <div className="flex items-center gap-3 mb-4">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', config.bg)}>
          <TrendingUp className={cn('w-5 h-5', config.color)} />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">{t('safetyScore')}</h3>
          <p className="text-xs text-muted-foreground">Live movement analysis</p>
        </div>
      </div>

      {/* Safety Score Meter */}
      <div className={cn('p-5 rounded-2xl mb-4 border-2 transition-all duration-500', config.bg, config.border)}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <RiskIcon className={cn('w-6 h-6', config.color)} />
            <span className="font-bold text-foreground text-sm uppercase tracking-tight">Current Condition</span>
          </div>
          <span className={cn('text-4xl font-black', config.color)}>
            {score}
          </span>
        </div>

        {/* Live Progress Bar */}
        <div className="w-full bg-gray-200/50 rounded-full h-3 overflow-hidden border border-white/50">
          <div
            className={cn("h-full rounded-full transition-all duration-1000 ease-out",
              score >= 80 ? "bg-green-500" : score >= 50 ? "bg-yellow-500" : "bg-red-500"
            )}
            style={{ width: `${score}%` }}
          ></div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="bg-white/40 p-2 rounded-lg border border-white/60">
            <p className="text-[10px] uppercase font-black text-muted-foreground mb-0.5">Area Risk</p>
            <p className={cn("text-xs font-bold uppercase", config.color)}>{riskLevel || 'Safe'}</p>
          </div>
          <div className="bg-white/40 p-2 rounded-lg border border-white/60">
            <p className="text-[10px] uppercase font-black text-muted-foreground mb-0.5">Battery Status</p>
            <p className="text-xs font-bold text-foreground">{batteryLevel}%</p>
          </div>
        </div>
      </div>

      {/* Dynamic AI Recommendations */}
      <div className="space-y-2 mt-4">
        <p className="text-[10px] font-black text-foreground uppercase tracking-wider mb-2">AI Safety Protocol:</p>

        <div className="flex items-start gap-2 p-2 bg-green-50/50 rounded-lg border border-green-100">
          <span className="text-green-600 font-bold text-xs mt-0.5">✓</span>
          <p className="text-[11px] text-green-800 font-medium">Real-time location sharing is ACTIVE</p>
        </div>

        {score < 60 && (
          <div className="flex items-start gap-2 p-2 bg-yellow-50/50 rounded-lg border border-yellow-100 animate-pulse">
            <span className="text-yellow-600 font-bold text-xs mt-0.5">!</span>
            <p className="text-[11px] text-yellow-800 font-bold italic">Safety score dropping. Stay in well-lit areas.</p>
          </div>
        )}

        {score < 40 && (
          <div className="flex items-start gap-2 p-2 bg-red-50/50 rounded-lg border border-red-100 animate-bounce">
            <span className="text-red-600 font-bold text-xs mt-0.5">⚠️</span>
            <p className="text-[11px] text-red-800 font-black uppercase">Low score: Guardians notified of zone risk.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RiskScoreCard;
