
import React, { useState } from 'react';
import { Task } from '@/types';
import { useTaskContext } from '@/context/TaskContext';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Flag, CalendarIcon } from 'lucide-react';
import TaskDetail from './TaskDetail';

interface TaskItemProps {
  task: Task;
  compact?: boolean;
  showDetails?: boolean;
}

const TaskItem = ({ task, compact = false, showDetails = false }: TaskItemProps) => {
  const { toggleTaskCompletion } = useTaskContext();
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-task-high';
      case 'medium':
        return 'bg-task-medium';
      case 'low':
        return 'bg-task-low';
      default:
        return 'bg-gray-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    const color = priority === 'high' ? 'text-red-500' : 
                 priority === 'medium' ? 'text-orange-500' : 
                 'text-blue-500';
    
    return <Flag className={`w-3 h-3 ${color}`} />;
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleTaskCompletion(task.id);
  };

  if (compact) {
    return (
      <div 
        className={`
          px-2 py-1 rounded text-xs flex items-center gap-1 text-left
          ${getPriorityColor(task.priority)} 
          ${task.completed ? 'opacity-60' : ''}
        `}
        onClick={(e) => {
          e.stopPropagation();
          setIsDetailOpen(true);
        }}
      >
        <span className="flex-1 truncate">{task.title}</span>
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent>
            <TaskDetail task={task} onClose={() => setIsDetailOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div 
      className={`
        relative border rounded-lg p-3 transition-all animate-fade-in
        hover:shadow-md cursor-pointer 
        ${task.completed ? 'task-completed bg-gray-50' : 'bg-white'}
      `}
      onClick={() => setIsDetailOpen(true)}
    >
      <div className="flex gap-3 items-start">
        <div className="pt-1" onClick={handleToggle}>
          <Checkbox checked={task.completed} />
        </div>
        <div className="flex-1">
          <div className="relative">
            <h3 className="font-medium task-text">{task.title}</h3>
            <div className="task-complete-line" />
          </div>
          
          {showDetails && (
            <div className="mt-2 space-y-2">
              {task.subtasks.length > 0 && (
                <div className="text-sm">
                  <p className="text-gray-500 mb-1">Subtasks ({task.subtasks.filter(s => s.completed).length}/{task.subtasks.length})</p>
                  <ul className="pl-5 space-y-1">
                    {task.subtasks.slice(0, 2).map(subtask => (
                      <li key={subtask.id} className="flex items-center gap-2">
                        <div className="w-3 h-3 border rounded-sm">
                          {subtask.completed && (
                            <div className="w-full h-full bg-primary/50" />
                          )}
                        </div>
                        <span className={`text-sm ${subtask.completed ? 'text-gray-400 line-through' : ''}`}>
                          {subtask.title}
                        </span>
                      </li>
                    ))}
                    {task.subtasks.length > 2 && (
                      <li className="text-xs text-gray-400">
                        +{task.subtasks.length - 2} more
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}
          
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <CalendarIcon className="w-3 h-3" />
              <span>{format(task.date, 'MMM d')}</span>
            </div>
            <div className="flex items-center gap-1">
              {getPriorityIcon(task.priority)}
              <span className="capitalize">{task.priority}</span>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent>
          <TaskDetail task={task} onClose={() => setIsDetailOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaskItem;
