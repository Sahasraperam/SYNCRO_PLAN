
import React from 'react';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  isToday,
} from 'date-fns';
import { useTaskContext } from '@/context/TaskContext';
import TaskItem from '../Tasks/TaskItem';

interface MonthViewProps {
  currentDate: Date;
  onDateClick: (date: Date) => void;
}

const MonthView = ({ currentDate, onDateClick }: MonthViewProps) => {
  const { getTasksForDate } = useTaskContext();
  
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="animate-fade-in w-full h-full">
      <div className="grid grid-cols-7 gap-1 mb-1">
        {dayNames.map((day) => (
          <div 
            key={day} 
            className="text-center text-sm py-2 font-medium"
          >
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 auto-rows-fr h-[calc(100%-2rem)]">
        {days.map((day) => {
          const tasksForDay = getTasksForDate(day);
          const formattedDate = format(day, 'd');
          const isCurrentMonth = isSameMonth(day, monthStart);
          
          return (
            <div
              key={day.toString()}
              onClick={() => onDateClick(day)}
              className={`
                h-full min-h-[80px] p-1 sm:p-2 border rounded-lg transition-colors
                hover:bg-gray-50 cursor-pointer flex flex-col
                ${isCurrentMonth ? 'bg-white' : 'bg-gray-50 text-gray-400'}
                ${isToday(day) ? 'border-primary' : 'border-gray-200'}
              `}
            >
              <div className="text-right">
                <span 
                  className={`
                    inline-block rounded-full w-6 h-6 text-center pt-0.5
                    ${isToday(day) ? 'bg-primary text-white' : ''}
                  `}
                >
                  {formattedDate}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto mt-1 space-y-1">
                {tasksForDay.slice(0, 2).map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    compact={true}
                  />
                ))}
                {tasksForDay.length > 2 && (
                  <div className="text-xs text-gray-500 mt-1">
                    +{tasksForDay.length - 2} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MonthView;
