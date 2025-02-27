
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LineChart, 
  BarChart3, 
  Cloud, 
  Wind, 
  Bell, 
  Settings, 
  Home, 
  ChevronLeft, 
  ChevronRight,
  HelpCircle,
  User,
  Menu,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Logo from './Logo';

interface SidebarProps {
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: Home },
    { name: 'Weather', path: '/weather', icon: Cloud },
    { name: 'Air Quality', path: '/air-quality', icon: Wind },
    { name: 'Insights', path: '/insights', icon: LineChart },
    { name: 'Alerts', path: '/alerts', icon: Bell },
    { name: 'Settings', path: '/settings', icon: Settings },
    { name: 'Support', path: '/support', icon: HelpCircle },
  ];

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const toggleMobileSidebar = () => {
    setMobileOpen(!mobileOpen);
  };

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') {
      return true;
    }
    if (path !== '/' && location.pathname.startsWith(path)) {
      return true;
    }
    return false;
  };

  const renderMenuItems = () => {
    return menuItems.map((item) => {
      const Icon = item.icon;
      const active = isActive(item.path);
      
      return (
        <li key={item.name}>
          <Link
            to={item.path}
            className={cn(
              'flex items-center space-x-3 rounded-md px-3 py-2 transition-all duration-300 hover:bg-sidebar-accent',
              active ? 'bg-sidebar-accent text-white' : 'text-sidebar-foreground/80 hover:text-white'
            )}
            onClick={() => setMobileOpen(false)}
          >
            <Icon className={cn('h-5 w-5', active ? 'text-white' : 'text-sidebar-foreground/80')} />
            {!collapsed && <span>{item.name}</span>}
          </Link>
        </li>
      );
    });
  };

  return (
    <>
      {/* Mobile menu button - only visible on small screens */}
      <button
        className="fixed top-4 left-4 z-50 p-2 bg-stratos-700 text-white rounded-md md:hidden"
        onClick={toggleMobileSidebar}
        aria-label="Toggle menu"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar - transforms off-screen on mobile when closed */}
      <aside
        className={cn(
          'flex flex-col fixed inset-y-0 left-0 z-40 bg-stratos-700 text-white transition-all duration-300 ease-in-out',
          collapsed ? 'w-16' : 'w-64',
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
          className
        )}
      >
        <div className="flex justify-between items-center p-4 border-b border-sidebar-border">
          {!collapsed ? (
            <Logo variant="default" size="md" className="text-white" />
          ) : (
            <Logo variant="icon" size="md" />
          )}
          <button
            onClick={toggleSidebar}
            className="p-1 rounded-md hover:bg-sidebar-accent md:flex hidden"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-2">
          <ul className="space-y-1">
            {renderMenuItems()}
          </ul>
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <div className={cn(
            "flex items-center space-x-3",
            collapsed ? "justify-center" : "justify-start"
          )}>
            <div className="w-8 h-8 rounded-full bg-stratos-500 flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="text-sm font-medium">Farm Admin</span>
                <span className="text-xs text-sidebar-foreground/70">admin@farm.com</span>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
