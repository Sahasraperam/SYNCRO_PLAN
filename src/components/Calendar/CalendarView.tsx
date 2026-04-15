
import React, { useState, useEffect } from 'react';
import { ViewMode } from '@/types';
import CalendarHeader from './CalendarHeader';
import MonthView from './MonthView';
import WeekView from './WeekView';
import DayView from './DayView';

interface CalendarViewProps {
  onDateSelect: (date: Date) => void;
  onViewModeChange?: (viewMode: ViewMode) => void;
}

const CalendarView = ({ onDateSelect, onViewModeChange }: CalendarViewProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');

  const handleDateClick = (date: Date) => {
    setCurrentDate(date);
    onDateSelect(date);
    if (viewMode === 'month') {
      setViewMode('week');
    } else if (viewMode === 'week') {
      setViewMode('day');
    }
  };

  // When view mode or current date changes, update the selected date and notify parent
  useEffect(() => {
    onDateSelect(currentDate);
    if (onViewModeChange) {
      onViewModeChange(viewMode);
    }
  }, [currentDate, viewMode, onDateSelect, onViewModeChange]);

  // Create a wrapper for setViewMode that also notifies the parent
  const handleViewModeChange = (newViewMode: ViewMode) => {
    setViewMode(newViewMode);
    if (onViewModeChange) {
      onViewModeChange(newViewMode);
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden px-4 py-2">
      <CalendarHeader
        currentDate={currentDate}
        viewMode={viewMode}
        setCurrentDate={setCurrentDate}
        setViewMode={handleViewModeChange}
      />
      
      <div className="flex-1 overflow-auto">
        {viewMode === 'month' && (
          <MonthView currentDate={currentDate} onDateClick={handleDateClick} />
        )}
        
        {viewMode === 'week' && (
          <WeekView currentDate={currentDate} onDateClick={handleDateClick} />
        )}
        
        {viewMode === 'day' && (
          <DayView currentDate={currentDate} />
        )}
      </div>
    </div>
  );
};

export default CalendarView;
