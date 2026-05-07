
import React from 'react';
import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isToday,
} from 'date-fns';
import { useTaskContext } from '@/context/TaskContext';
import TaskList from '../Tasks/TaskList';

interface WeekViewProps {
  currentDate: Date;
  onDateClick: (date: Date) => void;
}

const WeekView = ({ currentDate, onDateClick }: WeekViewProps) => {
  const { getTasksForDate } = useTaskContext();
  
  const weekStart = startOfWeek(currentDate);
  const weekEnd = endOfWeek(currentDate);
  
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
  
  return (
    <div className="space-y-4 animate-fade-in">
      {days.map((day) => {
        const tasksForDay = getTasksForDate(day);
        
        return (
          <div key={day.toString()} className="border border-border/40 rounded-xl overflow-hidden bg-card/20 backdrop-blur-sm transition-all duration-300 hover:border-border/80">
            <div 
              onClick={() => onDateClick(day)}
              className={`
                p-3 cursor-pointer transition-colors
                ${isToday(day) ? 'bg-primary/20 text-primary-foreground font-semibold' : 'bg-card/40 hover:bg-card/60'}
              `}
            >
              <h3 className="font-medium flex justify-between">
                <span>{format(day, 'EEEE')}</span>
                <span>{format(day, 'MMM d')}</span>
              </h3>
            </div>
            <div className="p-2">
              {tasksForDay.length > 0 ? (
                <TaskList tasks={tasksForDay} />
              ) : (
                <div className="text-center py-4 text-muted-foreground italic">
                  No tasks scheduled
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default WeekView;
