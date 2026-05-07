
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Menu } from 'lucide-react';
import { format } from 'date-fns';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetTrigger } from '@/components/ui/sheet';
import { ModeToggle } from '@/components/ModeToggle';

// Create a context to control the sidebar visibility from anywhere
export const SidebarContext = React.createContext<{
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}>({
  isOpen: false,
  setIsOpen: () => {},
});

export const useSidebarContext = () => React.useContext(SidebarContext);

const Header = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const isMobile = useIsMobile();
  const { isOpen, setIsOpen } = useSidebarContext();

  // Update the date every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const formattedDate = isMobile 
    ? format(currentDate, 'MMM d')
    : format(currentDate, 'EEEE, MMMM d, yyyy');

  return (
    <header className="border-b border-border/50 bg-background/60 backdrop-blur-xl sticky top-0 z-10 transition-all duration-300">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            {/* SheetContent will be rendered from the Index.tsx page */}
          </Sheet>
          <CalendarIcon className="h-6 w-6 text-primary drop-shadow-[0_0_8px_rgba(139,92,246,0.6)]" />
          <h1 className="text-xl font-semibold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">SyncroPlan</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="hidden sm:flex bg-transparent backdrop-blur-md border-border/50">
            <span className="text-xs sm:text-sm">{formattedDate}</span>
          </Button>
          <span className="sm:hidden text-xs font-medium">{formattedDate}</span>
          <ModeToggle />
        </div>
      </div>
    </header>
  );
};

export default Header;
