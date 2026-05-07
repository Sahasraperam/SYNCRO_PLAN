
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Task, Priority, Subtask } from '../types';
import { isSameDay } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

interface TaskContextProps {
  tasks: Task[];
  isLoading: boolean;
  addTask: (title: string, date: Date, priority: Priority, subtasks: Subtask[]) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTaskCompletion: (id: string) => Promise<void>;
  toggleSubtaskCompletion: (taskId: string, subtaskId: string) => Promise<void>;
  deleteSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  updateTask: (task: Task) => Promise<void>;
  updateTaskDate: (id: string, date: Date) => Promise<void>;
  getTasksForDate: (date: Date) => Task[];
  getTasksForMonth: (year: number, month: number) => Task[];
  getTasksForWeek: (date: Date) => Task[];
}

const TaskContext = createContext<TaskContextProps>({} as TaskContextProps);

export const useTaskContext = () => useContext(TaskContext);

// --- DB <-> App type mapping helpers ---

const isPriority = (value: unknown): value is Priority =>
  value === 'low' || value === 'medium' || value === 'high';

type DbSubtaskRow = {
  id: string;
  title: string;
  completed: boolean | null;
};

type DbTaskRow = {
  id: string;
  title: string;
  completed: boolean | null;
  due_date: string;
  priority: string | null;
  created_at: string;
  user_id: string | null;
  subtasks: DbSubtaskRow[];
};

/**
 * Maps a Supabase tasks row with joined subtasks to the app's Task type.
 */
const dbRowToTask = (row: DbTaskRow): Task => {
  const subtasks: Subtask[] = (row.subtasks || []).map(s => ({
    id: s.id,
    title: s.title,
    completed: !!s.completed
  }));
  
  return {
    id: row.id,
    title: row.title,
    completed: !!row.completed,
    date: new Date(row.due_date),
    priority: isPriority(row.priority) ? row.priority : 'medium',
    subtasks,
  };
};

// --- Provider ---

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('tasks')
      // NOTE: We request the 'subtasks' join. We use * inside to get fields
      .select('*, subtasks(*)')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setTasks((data as unknown as DbTaskRow[]).map(dbRowToTask));
    }
    setIsLoading(false);
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Realtime subscription — re-fetch whenever tasks or subtasks change
  useEffect(() => {
    const tasksChannel = supabase
      .channel('tasks-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => fetchTasks())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'subtasks' }, () => fetchTasks())
      .subscribe();

    return () => { supabase.removeChannel(tasksChannel); };
  }, [fetchTasks]);

  // --- CRUD operations ---

  const addTask = async (title: string, date: Date, priority: Priority, newSubtasks: Subtask[]) => {
    const { data, error } = await supabase
      .from('tasks')
      .insert([{
        title,
        due_date: date.toISOString(),
        priority,
        completed: false,
        // Omitted user_id, defaults to null so foreign key doesn't fail
      }])
      .select()
      .single();

    if (!error && data) {
      let insertedSubtasks: DbSubtaskRow[] = [];
      if (newSubtasks.length > 0) {
        // Insert relational subtasks into the separate table
        const { data: stData } = await supabase
          .from('subtasks')
          .insert(newSubtasks.map(s => ({
            task_id: data.id,
            title: s.title,
            completed: false
          })))
          .select();
        
        if (stData) {
          insertedSubtasks = stData as unknown as DbSubtaskRow[];
        }
      }
      
      const fullRow: DbTaskRow = { ...(data as unknown as Omit<DbTaskRow, 'subtasks'>), subtasks: insertedSubtasks };
      setTasks(prev => [dbRowToTask(fullRow), ...prev]);
    }
  };

  const deleteTask = async (id: string) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (!error) {
      setTasks(prev => prev.filter(t => t.id !== id));
    }
  };

  const toggleTaskCompletion = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const { error } = await supabase
      .from('tasks')
      .update({ completed: !task.completed })
      .eq('id', id);

    if (!error) {
      setTasks(prev =>
        prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
      );
    }
  };

  const toggleSubtaskCompletion = async (taskId: string, subtaskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    const subtask = task.subtasks.find(s => s.id === subtaskId);
    if (!subtask) return;

    // Mutate the specific subtask row
    const { error } = await supabase
      .from('subtasks')
      .update({ completed: !subtask.completed })
      .eq('id', subtaskId);

    if (!error) {
      const nextSubtasks = task.subtasks.map(s => 
        s.id === subtaskId ? { ...s, completed: !s.completed } : s
      );
      
      // Auto-complete the parent task if all subtasks are done
      const allCompleted = nextSubtasks.length > 0 && nextSubtasks.every(s => s.completed);
      
      if (allCompleted !== task.completed) {
        await supabase.from('tasks').update({ completed: allCompleted }).eq('id', taskId);
      }

      setTasks(prev =>
        prev.map(t =>
          t.id === taskId ? { ...t, subtasks: nextSubtasks, completed: allCompleted } : t
        )
      );
    }
  };

  const deleteSubtask = async (taskId: string, subtaskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const { error } = await supabase.from('subtasks').delete().eq('id', subtaskId);

    if (!error) {
      const nextSubtasks = task.subtasks.filter(s => s.id !== subtaskId);
      const completed = nextSubtasks.length > 0 ? nextSubtasks.every(s => s.completed) : task.completed;
      
      if (completed !== task.completed) {
         await supabase.from('tasks').update({ completed }).eq('id', taskId);
      }

      setTasks(prev =>
        prev.map(t => t.id === taskId ? { ...t, subtasks: nextSubtasks, completed } : t)
      );
    }
  };

  const updateTask = async (updatedTask: Task) => {
    const { error } = await supabase
      .from('tasks')
      .update({
        title: updatedTask.title,
        due_date: updatedTask.date.toISOString(),
        priority: updatedTask.priority,
        completed: updatedTask.completed,
      })
      .eq('id', updatedTask.id);

    if (!error) {
      setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
    }
  };

  const updateTaskDate = async (id: string, date: Date) => {
    const { error } = await supabase
      .from('tasks')
      .update({ due_date: date.toISOString() })
      .eq('id', id);

    if (!error) {
      setTasks(prev => prev.map(t => t.id === id ? { ...t, date } : t));
    }
  };

  // --- Pure filter helpers (synchronous, work on in-memory state) ---

  const getTasksForDate = (date: Date) =>
    tasks.filter(task => isSameDay(task.date, date));

  const getTasksForMonth = (year: number, month: number) =>
    tasks.filter(task =>
      task.date.getFullYear() === year && task.date.getMonth() === month
    );

  const getTasksForWeek = (date: Date) => {
    const day = date.getDay();
    const startDate = new Date(date);
    startDate.setDate(date.getDate() - day);
    const endDate = new Date(date);
    endDate.setDate(date.getDate() + (6 - day));
    return tasks.filter(task => task.date >= startDate && task.date <= endDate);
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        isLoading,
        addTask,
        deleteTask,
        toggleTaskCompletion,
        toggleSubtaskCompletion,
        deleteSubtask,
        updateTask,
        updateTaskDate,
        getTasksForDate,
        getTasksForMonth,
        getTasksForWeek,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

