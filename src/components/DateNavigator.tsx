import React from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { getLocalDateString } from '../services/habitService';

interface DateNavigatorProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

export const DateNavigator: React.FC<DateNavigatorProps> = ({
  selectedDate,
  onSelectDate
}) => {
  const todayStr = getLocalDateString(new Date());

  const handlePrevDay = () => {
    const d = new Date(selectedDate + 'T00:00:00');
    d.setDate(d.getDate() - 1);
    onSelectDate(getLocalDateString(d));
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate + 'T00:00:00');
    d.setDate(d.getDate() + 1);
    onSelectDate(getLocalDateString(d));
  };

  const handleToday = () => {
    onSelectDate(todayStr);
  };

  const formattedDate = React.useMemo(() => {
    const d = new Date(selectedDate + 'T00:00:00');
    const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' };
    const dateFormatted = d.toLocaleDateString('en-US', options);

    if (selectedDate === todayStr) {
      return `Today, ${dateFormatted}`;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (selectedDate === getLocalDateString(yesterday)) {
      return `Yesterday, ${dateFormatted}`;
    }

    return dateFormatted;
  }, [selectedDate, todayStr]);

  const isToday = selectedDate === todayStr;

  return (
    <div className="flex items-center gap-2">
      {!isToday && (
        <button
          type="button"
          onClick={handleToday}
          className="text-xs font-semibold px-2.5 py-1.5 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 border border-blue-400/40 transition-colors"
        >
          Back to Today
        </button>
      )}

      <div className="flex items-center bg-slate-900/90 rounded-2xl border border-white/10 p-1 shadow-md">
        <button
          type="button"
          onClick={handlePrevDay}
          aria-label="Previous day"
          className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 px-3 select-none">
          <CalendarIcon className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-xs sm:text-sm font-bold text-white whitespace-nowrap">
            {formattedDate}
          </span>
        </div>

        <button
          type="button"
          onClick={handleNextDay}
          aria-label="Next day"
          className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
