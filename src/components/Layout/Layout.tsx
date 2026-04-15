
import React from 'react';
import Header, { SidebarContext } from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  // Create state for the sidebar and provide it through context
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <SidebarContext.Provider value={{ isOpen, setIsOpen }}>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </SidebarContext.Provider>
  );
};

export default Layout;
