
import React, { useState } from 'react';
import { Task, Priority } from '@/types';
import { useTaskContext } from '@/context/TaskContext';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, Trash, Plus, Check, X } from 'lucide-react';

interface TaskDetailProps {
  task: Task;
  onClose: () => void;
}

const TaskDetail = ({ task, onClose }: TaskDetailProps) => {
  const { updateTask, deleteTask, toggleSubtaskCompletion, deleteSubtask } = useTaskContext();
  
  const [title, setTitle] = useState(task.title);
  const [date, setDate] = useState<Date>(task.date);
  const [priority, setPriority] = useState<Priority>(task.priority);
  const [newSubtask, setNewSubtask] = useState('');
  
  const handleSave = () => {
    const updatedTask: Task = {
      ...task,
      title,
      date,
      priority,
    };
    updateTask(updatedTask);
    onClose();
  };
  
  const handleDelete = () => {
    deleteTask(task.id);
    onClose();
  };
  
  const addSubtask = () => {
    if (newSubtask.trim() !== '') {
      updateTask({
        ...task,
        completed: false,
        subtasks: [
          ...task.subtasks,
          {
            id: Date.now().toString(),
            title: newSubtask,
            completed: false,
          },
        ],
      });
      setNewSubtask('');
    }
  };
  
  return (
    <div className="space-y-4">
      <div>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-lg font-medium border-none shadow-none px-0 focus-visible:ring-0"
          placeholder="Task title"
        />
      </div>
      
      <div className="flex gap-4 flex-wrap">
        <div>
          <p className="text-sm text-gray-500 mb-1">Due Date</p>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="flex gap-2">
                <CalendarIcon className="h-4 w-4" />
                {format(date, 'MMM d, yyyy')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 pointer-events-auto">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(date) => date && setDate(date)}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div>
          <p className="text-sm text-gray-500 mb-1">Priority</p>
          <Select
            value={priority}
            onValueChange={(value: Priority) => setPriority(value)}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div>
        <p className="text-sm text-gray-500 mb-1">Subtasks</p>
        <div className="space-y-2">
          {task.subtasks.map((subtask) => (
            <div key={subtask.id} className="flex items-center gap-2">
              <Checkbox 
                checked={subtask.completed}
                onClick={() => toggleSubtaskCompletion(task.id, subtask.id)}
              />
              <span className={`flex-1 ${subtask.completed ? 'line-through text-gray-400' : ''}`}>
                {subtask.title}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-gray-400 hover:text-destructive"
                onClick={() => deleteSubtask(task.id, subtask.id)}
                aria-label="Delete subtask"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          
          <div className="flex gap-2 mt-2">
            <Input
              placeholder="Add subtask"
              value={newSubtask}
              onChange={(e) => setNewSubtask(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addSubtask()}
            />
            <Button size="icon" onClick={addSubtask}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between pt-4">
        <Button 
          variant="outline" 
          size="icon"
          onClick={handleDelete}
        >
          <Trash className="h-4 w-4" />
        </Button>
        <div className="space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Check className="h-4 w-4 mr-2" /> Save
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;
