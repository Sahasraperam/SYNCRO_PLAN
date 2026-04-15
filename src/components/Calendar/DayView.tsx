
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
      <div className="mb-4 bg-primary/10 p-4 rounded-lg">
        <h2 className="text-xl font-medium">
          {format(currentDate, 'EEEE, MMMM d, yyyy')}
        </h2>
      </div>
      
      {tasksForDay.length > 0 ? (
        <TaskList tasks={tasksForDay} showDetails={true} />
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg border">
          <p className="text-gray-500">No tasks scheduled for today</p>
          <p className="text-gray-400 text-sm mt-1">
            Click the + button to add a task
          </p>
        </div>
      )}
    </div>
  );
};

export default DayView;
