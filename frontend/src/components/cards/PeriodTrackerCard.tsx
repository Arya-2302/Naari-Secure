import { useState } from 'react';
import { Calendar, Edit2 } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { format, addDays, differenceInDays, parseISO } from 'date-fns';

const PeriodTrackerCard = () => {
  const { lastPeriodDate, cycleLength, updatePeriodData } = useApp();
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [tempDate, setTempDate] = useState(lastPeriodDate || '');
  const [tempCycle, setTempCycle] = useState(cycleLength.toString());

  const handleSave = () => {
    updatePeriodData(tempDate, parseInt(tempCycle) || 28);
    setIsEditing(false);
  };

  const getNextExpectedDate = () => {
    if (!lastPeriodDate) return null;
    return addDays(parseISO(lastPeriodDate), cycleLength);
  };

  const getDaysUntilNext = () => {
    const nextDate = getNextExpectedDate();
    if (!nextDate) return null;
    return differenceInDays(nextDate, new Date());
  };

  const daysUntil = getDaysUntilNext();

  return (
    <div className="elevated-card p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{t('periodTracker')}</h3>
            <p className="text-xs text-muted-foreground">Daily Utility</p>
          </div>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
        >
          <Edit2 className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground block mb-1">{t('lastPeriod')}</label>
            <input
              type="date"
              value={tempDate}
              onChange={(e) => setTempDate(e.target.value)}
              className="w-full input-soft text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">{t('cycleLength')} ({t('days')})</label>
            <input
              type="number"
              value={tempCycle}
              onChange={(e) => setTempCycle(e.target.value)}
              className="w-full input-soft text-sm"
              min="21"
              max="35"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(false)}
              className="flex-1 py-2 rounded-lg bg-muted text-foreground text-sm font-medium"
            >
              {t('cancel')}
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
            >
              {t('save')}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex justify-between items-center p-2 bg-muted/50 rounded-lg">
            <span className="text-xs text-muted-foreground">{t('lastPeriod')}</span>
            <span className="text-sm font-medium text-foreground">
              {lastPeriodDate ? format(parseISO(lastPeriodDate), 'MMM dd, yyyy') : 'Not set'}
            </span>
          </div>
          <div className="flex justify-between items-center p-2 bg-muted/50 rounded-lg">
            <span className="text-xs text-muted-foreground">{t('cycleLength')}</span>
            <span className="text-sm font-medium text-foreground">{cycleLength} {t('days')}</span>
          </div>
          {daysUntil !== null && (
            <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg border border-primary/20">
              <span className="text-xs text-primary font-medium">{t('nextExpected')}</span>
              <span className="text-sm font-bold text-primary">
                {daysUntil <= 0 ? 'Today' : `${daysUntil} ${t('days')}`}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PeriodTrackerCard;
