
import React, { useState } from 'react';
import Layout from '@/components/Layout/Layout';
import CalendarView from '@/components/Calendar/CalendarView';
import NewTaskButton from '@/components/Tasks/NewTaskButton';
import TaskList from '@/components/Tasks/TaskList';
import { TaskProvider, useTaskContext } from '@/context/TaskContext';
import { ViewMode } from '@/types';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useSidebarContext } from '@/components/Layout/Header';

const TaskSidebar = ({ 
  currentDate, 
  viewMode 
}: { 
  currentDate: Date; 
  viewMode: ViewMode 
}) => {
  const { getTasksForDate, getTasksForWeek, getTasksForMonth } = useTaskContext();
  
  // Get tasks based on the current view mode
  const getTasks = () => {
    switch (viewMode) {
      case 'day':
        return getTasksForDate(currentDate);
      case 'week':
        return getTasksForWeek(currentDate);
      case 'month':
        return getTasksForMonth(currentDate.getFullYear(), currentDate.getMonth());
      default:
        return getTasksForDate(currentDate);
    }
  };

  const tasks = getTasks();
  
  // Generate title based on the current view mode
  const getTitle = () => {
    switch (viewMode) {
      case 'day':
        return "Day's Tasks";
      case 'week':
        return "Week's Tasks";
      case 'month':
        return "Month's Tasks";
      default:
        return "Tasks";
    }
  };

  return (
    <div className="h-full border-r bg-white p-4 overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4">
        {getTitle()}
      </h2>
      <TaskList tasks={tasks} showDetails />
    </div>
  );
};

const CalendarContent = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const { isOpen, setIsOpen } = useSidebarContext();

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Desktop sidebar */}
      <div className="hidden md:block md:w-1/4">
        <TaskSidebar currentDate={selectedDate} viewMode={viewMode} />
      </div>

      {/* Mobile sidebar using Sheet */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="left" className="w-3/4 p-0">
          <TaskSidebar currentDate={selectedDate} viewMode={viewMode} />
        </SheetContent>
      </Sheet>

      {/* Calendar area - takes full width on mobile, 3/4 on desktop */}
      <div className="w-full md:w-3/4 h-full">
        <CalendarView 
          onDateSelect={setSelectedDate} 
          onViewModeChange={setViewMode}
        />
      </div>
      <NewTaskButton />
    </div>
  );
};

const Index = () => {
  return (
    <TaskProvider>
      <Layout>
        <CalendarContent />
      </Layout>
    </TaskProvider>
  );
};

export default Index;
