
import React from 'react';
import { format, addDays, addMonths, addWeeks, subDays, subMonths, subWeeks } from 'date-fns';
import { Button } from "@/components/ui/button";
import { ViewMode } from '@/types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarHeaderProps {
  currentDate: Date;
  viewMode: ViewMode;
  setCurrentDate: (date: Date) => void;
  setViewMode: (mode: ViewMode) => void;
}

const CalendarHeader = ({
  currentDate,
  viewMode,
  setCurrentDate,
  setViewMode,
}: CalendarHeaderProps) => {
  const handlePrevious = () => {
    switch (viewMode) {
      case 'month':
        setCurrentDate(subMonths(currentDate, 1));
        break;
      case 'week':
        setCurrentDate(subWeeks(currentDate, 1));
        break;
      case 'day':
        setCurrentDate(subDays(currentDate, 1));
        break;
    }
  };

  const handleNext = () => {
    switch (viewMode) {
      case 'month':
        setCurrentDate(addMonths(currentDate, 1));
        break;
      case 'week':
        setCurrentDate(addWeeks(currentDate, 1));
        break;
      case 'day':
        setCurrentDate(addDays(currentDate, 1));
        break;
    }
  };

  const formatHeaderDate = () => {
    switch (viewMode) {
      case 'month':
        return format(currentDate, 'MMMM yyyy');
      case 'week':
        return `Week of ${format(currentDate, 'MMM d, yyyy')}`;
      case 'day':
        return format(currentDate, 'EEEE, MMMM d, yyyy');
      default:
        return format(currentDate, 'MMMM yyyy');
    }
  };

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        <h2 className="text-2xl font-semibold">{formatHeaderDate()}</h2>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex">
          <Button 
            variant="outline" 
            onClick={handlePrevious} 
            size="icon"
            className="rounded-r-none"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            onClick={handleNext} 
            size="icon"
            className="rounded-l-none"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex rounded-md overflow-hidden border border-input">
          <Button 
            variant={viewMode === 'month' ? 'default' : 'ghost'} 
            onClick={() => setViewMode('month')}
            className="rounded-none"
          >
            Month
          </Button>
          <Button 
            variant={viewMode === 'week' ? 'default' : 'ghost'} 
            onClick={() => setViewMode('week')}
            className="rounded-none"
          >
            Week
          </Button>
          <Button 
            variant={viewMode === 'day' ? 'default' : 'ghost'} 
            onClick={() => setViewMode('day')}
            className="rounded-none"
          >
            Day
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CalendarHeader;
