
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useTaskContext } from '@/context/TaskContext';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { Priority, Subtask } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const NewTaskButton = () => {
  const [open, setOpen] = useState(false);
  const { addTask } = useTaskContext();
  const { toast } = useToast();

  const [title, setTitle] = useState('');
  const [date, setDate] = useState<Date>(new Date());
  const [priority, setPriority] = useState<Priority>('medium');
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtask, setNewSubtask] = useState('');

  const handleAddTask = async () => {
    if (title.trim() !== '') {
      const result = await addTask(title, date, priority, subtasks);
      if (result.ok) {
        toast({
          title: "Task added successfully",
          description: `"${title}" has been added to your tasks.`
        });
        resetForm();
        setOpen(false);
      } else {
        toast({
          title: "Unable to add task",
          description: result.error,
          variant: "destructive",
        });
      }
    }
  };

  const resetForm = () => {
    setTitle('');
    setDate(new Date());
    setPriority('medium');
    setSubtasks([]);
    setNewSubtask('');
  };

  const handleCloseDialog = () => {
    resetForm();
    setOpen(false);
  };

  const addSubtask = () => {
    if (newSubtask.trim() !== '') {
      setSubtasks([
        ...subtasks,
        {
          id: Date.now().toString(),
          title: newSubtask,
          completed: false
        }
      ]);
      setNewSubtask('');
    }
  };

  return (
    <>
      <Button 
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-[0_0_20px_rgba(139,92,246,0.5)] hover:shadow-[0_0_30px_rgba(139,92,246,0.8)] transition-all duration-300 bg-primary hover:bg-primary/90 text-white z-50"
        size="icon"
        onClick={() => setOpen(true)}
      >
        <Plus className="h-7 w-7" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
            <DialogDescription>
              Create a new task with details and click add when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Input
                placeholder="Task title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-lg"
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
                {subtasks.map((subtask, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-5 h-5 border rounded flex items-center justify-center" />
                    <span>{subtask.title}</span>
                  </div>
                ))}
                
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Add subtask"
                    value={newSubtask}
                    onChange={(e) => setNewSubtask(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addSubtask()}
                  />
                  <Button size="icon" onClick={addSubtask}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button onClick={handleAddTask}>
                <Check className="h-4 w-4 mr-2" /> Add Task
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NewTaskButton;
