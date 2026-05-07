
import React from 'react';
import { format } from 'date-fns';
import { useTaskContext } from '@/context/TaskContext';
import TaskList from '../Tasks/TaskList';

interface DayViewProps {
  currentDate: Date;
}

const DayView = ({ currentDate }: DayViewProps) => {
  const { getTasksForDate } = useTaskContext();
  
  const tasksForDay = getTasksForDate(currentDate);
  
  return (
    <div className="animate-fade-in">
      <div className="mb-4 bg-primary/20 backdrop-blur-md p-4 rounded-xl border border-primary/30 shadow-[0_0_15px_rgba(139,92,246,0.15)]">
        <h2 className="text-xl font-medium">
          {format(currentDate, 'EEEE, MMMM d, yyyy')}
        </h2>
      </div>
      
      {tasksForDay.length > 0 ? (
        <TaskList tasks={tasksForDay} showDetails={true} />
      ) : (
        <div className="text-center py-8 bg-card/30 backdrop-blur-md rounded-xl border border-border/40">
          <p className="text-muted-foreground italic">No tasks scheduled for today</p>
          <p className="text-gray-400 text-sm mt-1">
            Click the + button to add a task
          </p>
        </div>
      )}
    </div>
  );
};

export default DayView;
