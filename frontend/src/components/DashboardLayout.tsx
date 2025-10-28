import { ReactNode } from 'react';
import { useSidebar } from '../context/SidebarContext';
import { cn } from '../utils/cn';
import Sidebar from './Sidebar';

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { isCollapsed } = useSidebar();

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main className={cn(
        "flex-1 transition-all duration-300",
        isCollapsed ? "ml-16" : "ml-64",
        "lg:pl-0"
      )}>
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;