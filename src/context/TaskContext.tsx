
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Task, Priority, Subtask } from '../types';
import { addDays, isSameDay } from 'date-fns';

const TASKS_STORAGE_KEY = 'calendared-tasks';

interface TaskContextProps {
  tasks: Task[];
  addTask: (title: string, date: Date, priority: Priority, subtasks: Subtask[]) => void;
  deleteTask: (id: string) => void;
  toggleTaskCompletion: (id: string) => void;
  toggleSubtaskCompletion: (taskId: string, subtaskId: string) => void;
  deleteSubtask: (taskId: string, subtaskId: string) => void;
  updateTask: (task: Task) => void;
  updateTaskDate: (id: string, date: Date) => void;
  getTasksForDate: (date: Date) => Task[];
  getTasksForMonth: (year: number, month: number) => Task[];
  getTasksForWeek: (date: Date) => Task[];
}

const TaskContext = createContext<TaskContextProps>({} as TaskContextProps);

export const useTaskContext = () => useContext(TaskContext);

const sampleTasks: Task[] = [
  {
    id: '1',
    title: 'Complete project proposal',
    completed: false,
    date: new Date(),
    priority: 'high',
    subtasks: [
      { id: '1-1', title: 'Research competition', completed: false },
      { id: '1-2', title: 'Write executive summary', completed: false },
    ],
  },
  {
    id: '2',
    title: 'Schedule team meeting',
    completed: false,
    date: addDays(new Date(), 1),
    priority: 'medium',
    subtasks: [],
  },
  {
    id: '3',
    title: 'Review quarterly reports',
    completed: false,
    date: addDays(new Date(), 2),
    priority: 'low',
    subtasks: [],
  },
];

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

const toTaskOrNull = (value: unknown): Task | null => {
  if (!value || typeof value !== 'object') return null;

  const candidate = value as Record<string, unknown>;
  if (
    typeof candidate.id !== 'string' ||
    typeof candidate.title !== 'string' ||
    typeof candidate.completed !== 'boolean' ||
    !isPriority(candidate.priority) ||
    typeof candidate.date !== 'string' ||
    !Array.isArray(candidate.subtasks)
  ) {
    return null;
  }

  const parsedDate = new Date(candidate.date);
  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  const subtasks = candidate.subtasks.filter(isSubtask);
  if (subtasks.length !== candidate.subtasks.length) {
    return null;
  }

  return {
    id: candidate.id,
    title: candidate.title,
    completed: candidate.completed,
    date: parsedDate,
    priority: candidate.priority,
    subtasks,
  };
};

const loadTasksFromStorage = (): Task[] => {
  try {
    const savedTasks = localStorage.getItem(TASKS_STORAGE_KEY);
    if (!savedTasks) {
      return sampleTasks;
    }

    const parsed = JSON.parse(savedTasks);
    if (!Array.isArray(parsed)) {
      localStorage.removeItem(TASKS_STORAGE_KEY);
      return sampleTasks;
    }

    const restoredTasks = parsed.map(toTaskOrNull);
    if (restoredTasks.some((task) => task === null)) {
      localStorage.removeItem(TASKS_STORAGE_KEY);
      return sampleTasks;
    }

    return restoredTasks as Task[];
  } catch {
    localStorage.removeItem(TASKS_STORAGE_KEY);
    return sampleTasks;
  }
};

const serializeTasks = (tasks: Task[]) =>
  tasks.map((task) => ({
    ...task,
    date: task.date.toISOString(),
  }));

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>(() => loadTasksFromStorage());

  useEffect(() => {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(serializeTasks(tasks)));
  }, [tasks]);

  const addTask = (title: string, date: Date, priority: Priority, subtasks: Subtask[]) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title,
      completed: false,
      date,
      priority,
      subtasks,
    };
    setTasks((prevTasks) => [...prevTasks, newTask]);
  };

  const deleteTask = (id: string) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
  };

  const toggleTaskCompletion = (id: string) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const toggleSubtaskCompletion = (taskId: string, subtaskId: string) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.id !== taskId) {
          return task;
        }

        const nextSubtasks = task.subtasks.map((subtask) =>
          subtask.id === subtaskId
            ? { ...subtask, completed: !subtask.completed }
            : subtask
        );

        const allSubtasksCompleted =
          nextSubtasks.length > 0 && nextSubtasks.every((subtask) => subtask.completed);

        return {
          ...task,
          subtasks: nextSubtasks,
          completed: allSubtasksCompleted,
        };
      })
    );
  };

  const deleteSubtask = (taskId: string, subtaskId: string) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.id !== taskId) {
          return task;
        }

        const nextSubtasks = task.subtasks.filter((subtask) => subtask.id !== subtaskId);

        return {
          ...task,
          subtasks: nextSubtasks,
          completed:
            nextSubtasks.length > 0
              ? nextSubtasks.every((subtask) => subtask.completed)
              : task.completed,
        };
      })
    );
  };

  const updateTask = (updatedTask: Task) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === updatedTask.id ? updatedTask : task
      )
    );
  };

  const updateTaskDate = (id: string, date: Date) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === id ? { ...task, date } : task
      )
    );
  };

  const getTasksForDate = (date: Date) => {
    return tasks.filter((task) => isSameDay(task.date, date));
  };

  const getTasksForMonth = (year: number, month: number) => {
    return tasks.filter((task) => {
      const taskDate = task.date;
      return taskDate.getFullYear() === year && taskDate.getMonth() === month;
    });
  };

  const getTasksForWeek = (date: Date) => {
    // This is a simplified approach - ideally we'd use date-fns or similar to get the proper week range
    const day = date.getDay();
    const startDate = new Date(date);
    startDate.setDate(date.getDate() - day);
    
    const endDate = new Date(date);
    endDate.setDate(date.getDate() + (6 - day));
    
    return tasks.filter((task) => {
      const taskDate = task.date;
      return taskDate >= startDate && taskDate <= endDate;
    });
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
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
