
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Task, Priority, Subtask } from '../types';
import { isSameDay } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

// Temporary anonymous user ID until authentication is implemented.
// Replace with `supabase.auth.getUser()` once auth is added.
const ANON_USER_ID = '00000000-0000-0000-0000-000000000000';

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

const isSubtask = (value: unknown): value is Subtask => {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.title === 'string' &&
    typeof candidate.completed === 'boolean'
  );
};

type DbTaskRow = {
  id: string;
  title: string;
  completed: boolean;
  due_date: string | null;
  priority: string | null;
  description: string | null;
  user_id: string;
  created_at: string;
  labels: string[] | null;
  project_id: string | null;
};

/**
 * Maps a Supabase tasks row to the app's Task type.
 * Subtasks are stored as JSON in the `description` field.
 */
const dbRowToTask = (row: DbTaskRow): Task => {
  let subtasks: Subtask[] = [];
  if (row.description) {
    try {
      const parsed = JSON.parse(row.description);
      if (Array.isArray(parsed)) {
        subtasks = parsed.filter(isSubtask);
      }
    } catch {
      // description may hold plain text from other sources; ignore parse errors
    }
  }
  return {
    id: row.id,
    title: row.title,
    completed: row.completed,
    date: row.due_date ? new Date(row.due_date) : new Date(),
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
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setTasks((data as DbTaskRow[]).map(dbRowToTask));
    }
    setIsLoading(false);
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Realtime subscription — re-fetch whenever any row changes
  useEffect(() => {
    const channel = supabase
      .channel('tasks-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        () => { fetchTasks(); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchTasks]);

  // --- CRUD operations ---

  const addTask = async (title: string, date: Date, priority: Priority, subtasks: Subtask[]) => {
    const { data, error } = await supabase
      .from('tasks')
      .insert([{
        title,
        due_date: date.toISOString(),
        priority,
        description: subtasks.length > 0 ? JSON.stringify(subtasks) : null,
        completed: false,
        user_id: ANON_USER_ID,
      }])
      .select()
      .single();

    if (!error && data) {
      setTasks(prev => [dbRowToTask(data as DbTaskRow), ...prev]);
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

    const nextSubtasks = task.subtasks.map(s =>
      s.id === subtaskId ? { ...s, completed: !s.completed } : s
    );
    const allCompleted = nextSubtasks.length > 0 && nextSubtasks.every(s => s.completed);

    const { error } = await supabase
      .from('tasks')
      .update({
        description: JSON.stringify(nextSubtasks),
        completed: allCompleted,
      })
      .eq('id', taskId);

    if (!error) {
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

    const nextSubtasks = task.subtasks.filter(s => s.id !== subtaskId);
    const completed =
      nextSubtasks.length > 0
        ? nextSubtasks.every(s => s.completed)
        : task.completed;

    const { error } = await supabase
      .from('tasks')
      .update({
        description: nextSubtasks.length > 0 ? JSON.stringify(nextSubtasks) : null,
        completed,
      })
      .eq('id', taskId);

    if (!error) {
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
        description:
          updatedTask.subtasks.length > 0 ? JSON.stringify(updatedTask.subtasks) : null,
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
