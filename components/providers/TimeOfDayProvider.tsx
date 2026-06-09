'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { TimeOfDay, useTimeOfDay } from '@/lib/hooks/useTimeOfDay';

interface TimeOfDayContextType {
  timeOfDay: TimeOfDay;
}

const TimeOfDayContext = createContext<TimeOfDayContextType>({ timeOfDay: 'night' });

export function useTimeOfDayContext() {
  return useContext(TimeOfDayContext);
}

interface TimeOfDayProviderProps {
  children: ReactNode;
}

export function TimeOfDayProvider({ children }: TimeOfDayProviderProps) {
  const timeInfo = useTimeOfDay();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Remove all time-of-day classes
    document.documentElement.classList.remove('time-morning', 'time-day', 'time-evening', 'time-night');
    // Add current time-of-day class
    document.documentElement.classList.add(`time-${timeInfo.timeOfDay}`);
  }, [timeInfo.timeOfDay, mounted]);

  return (
    <TimeOfDayContext.Provider value={{ timeOfDay: timeInfo.timeOfDay }}>
      {children}
    </TimeOfDayContext.Provider>
  );
}
