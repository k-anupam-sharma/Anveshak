import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../lib/AuthContext';
import { LayoutDashboard, FolderSearch, Network, Clock, AlertTriangle, Search, FileText, Users, Database, Settings, Activity } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function Sidebar({ isOpen }: { isOpen: boolean }) {
  const { user } = useAuth();
  if (!user) return null;

  const getLinks = () => {
    switch (user.role) {
      case 'admin':
        return [
          { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
          { to: '/cases', icon: FolderSearch, label: 'Cases' },
          { to: '/network', icon: Network, label: 'Network Explorer' },
          { to: '/timeline', icon: Clock, label: 'Timeline' },
          { to: '/leads', icon: AlertTriangle, label: 'Leads' },
          { to: '/search', icon: Search, label: 'Search' },
          { to: '/users', icon: Users, label: 'Users & Roles' },
          { to: '/data', icon: Database, label: 'Data Quality' },
          { to: '/settings', icon: Settings, label: 'System Settings' },
          { to: '/audit', icon: Activity, label: 'Audit Log' },
        ];
      case 'investigator':
        return [
          { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
          { to: '/cases', icon: FolderSearch, label: 'My Cases' },
          { to: '/network', icon: Network, label: 'Network Explorer' },
          { to: '/timeline', icon: Clock, label: 'Timeline' },
          { to: '/leads', icon: AlertTriangle, label: 'My Leads' },
          { to: '/search', icon: Search, label: 'Search' },
          { to: '/notes', icon: FileText, label: 'My Notes' },
        ];
      case 'supervisor':
        return [
          { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
          { to: '/cases', icon: FolderSearch, label: 'Case Oversight' },
          { to: '/network', icon: Network, label: 'Network Explorer' },
          { to: '/timeline', icon: Clock, label: 'Timeline' },
          { to: '/leads', icon: AlertTriangle, label: 'Lead Review' },
          { to: '/assignments', icon: Users, label: 'Case Assignments' },
          { to: '/cross-case', icon: Network, label: 'Cross-Case Analysis' },
          { to: '/search', icon: Search, label: 'Search' },
        ];
      default:
        return [];
    }
  };

  const links = getLinks();

  return (
    <aside className={cn("bg-surface border-r border-border transition-all duration-300 flex flex-col", isOpen ? "w-64" : "w-0 overflow-hidden md:w-20")}>
      <div className="h-16 flex items-center px-6 border-b border-border">
        <Network className="text-primary mr-3 shrink-0" size={24} />
        <span className={cn("font-bold text-lg tracking-tight whitespace-nowrap transition-opacity", !isOpen && "md:opacity-0 md:hidden")}>Anveshak</span>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 flex flex-col gap-2 px-3">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => cn(
              "flex items-center px-3 py-2.5 rounded-lg text-sm transition-colors font-medium whitespace-nowrap group",
              isActive ? "bg-primary/10 text-primary" : "text-slate-400 hover:text-slate-100 hover:bg-background"
            )}
            title={!isOpen ? link.label : undefined}
          >
            <link.icon size={20} className={cn("shrink-0", isOpen ? "mr-3" : "md:mx-auto")} />
            <span className={cn("transition-opacity", !isOpen && "md:opacity-0 md:hidden")}>{link.label}</span>
          </NavLink>
        ))}
      </div>
    </aside>
  );
}
