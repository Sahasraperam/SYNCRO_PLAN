
import React from 'react';
import { Task } from '@/types';
import TaskItem from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  showDetails?: boolean;
}

const TaskList = ({ tasks, showDetails = false }: TaskListProps) => {
  // Sort tasks by priority and completion status
  const sortedTasks = [...tasks].sort((a, b) => {
    // First by completion status
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    
    // Then by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  return (
    <div className="space-y-2">
      {sortedTasks.map((task) => (
        <TaskItem 
          key={task.id} 
          task={task} 
          showDetails={showDetails}
        />
      ))}
    </div>
  );
};

export default TaskList;
