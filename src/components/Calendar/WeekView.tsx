
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
          <div key={day.toString()} className="border rounded-lg overflow-hidden">
            <div 
              onClick={() => onDateClick(day)}
              className={`
                p-3 cursor-pointer
                ${isToday(day) ? 'bg-primary/10' : 'bg-gray-50'}
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
                <div className="text-center py-4 text-gray-400">
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
