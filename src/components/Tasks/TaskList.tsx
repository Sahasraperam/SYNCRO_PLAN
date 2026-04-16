
import { Task } from '@/types';
import TaskItem from './TaskItem';
import { useTaskContext } from '@/context/TaskContext';
import { Skeleton } from '@/components/ui/skeleton';

interface TaskListProps {
  tasks: Task[];
  showDetails?: boolean;
}

const TaskList = ({ tasks, showDetails = false }: TaskListProps) => {
  const { isLoading } = useTaskContext();

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map(i => (
          <div key={i} className="border rounded-lg p-3 bg-white space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <p className="text-sm text-gray-400 text-center py-6">No tasks for this period.</p>
    );
  }

  // Sort by completion status then priority
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  return (
    <div className="space-y-2">
      {sortedTasks.map(task => (
        <TaskItem key={task.id} task={task} showDetails={showDetails} />
      ))}
    </div>
  );
};

export default TaskList;
