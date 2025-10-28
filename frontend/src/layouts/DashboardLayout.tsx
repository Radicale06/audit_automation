import { ReactNode } from "react";
import { Menu } from 'lucide-react';
import Sidebar from "../components/Sidebar";
import UserSession from "../components/UserSession";
import { useSidebar } from "../context/SidebarContext";
import { cn } from "../utils/cn";

const DashboardLayout = ({ children }: { children: ReactNode }) => {
    const { isMobileOpen, setIsMobileOpen, isCollapsed } = useSidebar();

    return (
        <div className="flex h-screen bg-surface-50 dark:bg-surface-900 overflow-hidden">
            <Sidebar />

            {/* Overlay mobile */}
            {isMobileOpen && (
                <div 
                    className="fixed inset-0 bg-surface-900/50 backdrop-blur-sm z-20 lg:hidden"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            <div className={cn(
                "main-content",
                isCollapsed ? "lg:ml-16" : "lg:ml-24"
            )}>


                <main className="flex-1 overflow-auto p-6">
                    <div className="max-w-screen-2xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
