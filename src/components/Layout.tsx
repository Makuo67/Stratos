
import React, { ReactNode } from 'react';
import Sidebar from './Sidebar';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: ReactNode;
  className?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, className }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <main 
        className={cn(
          "min-h-screen pt-4 pb-16 px-4 md:px-6 md:ml-16 lg:ml-64 transition-all duration-300",
          className
        )}
      >
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
