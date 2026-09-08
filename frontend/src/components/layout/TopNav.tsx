import React, { useState, useEffect } from 'react';
import { useAuth } from '../../lib/AuthContext';
import { Menu, Bell, User as UserIcon, RefreshCw } from 'lucide-react';

export default function TopNav({ toggleSidebar }: { toggleSidebar: () => void }) {
  const { user, logout } = useAuth();
  const [neo4jStatus, setNeo4jStatus] = useState<'checking' | 'connected' | 'error'>('checking');

  useEffect(() => {
    fetch('http://localhost:8000/api/health/neo4j')
      .then(res => {
        if (res.ok) {
          setNeo4jStatus('connected');
        } else {
          setNeo4jStatus('error');
        }
      })
      .catch(() => setNeo4jStatus('error'));
  }, []);

  return (
    <header className="h-16 border-b border-border bg-surface flex items-center justify-between px-4 sticky top-0 z-20">
      <div className="flex items-center space-x-4">
        <button onClick={toggleSidebar} className="p-2 hover:bg-background rounded-md text-slate-400 hover:text-slate-100 transition-colors">
          <Menu size={20} />
        </button>
        <div className="flex items-center space-x-2 bg-background border border-border px-3 py-1 rounded-full text-xs font-medium text-slate-400">
          <RefreshCw size={12} className="animate-spin text-primary" style={{ animationDuration: '3s' }} />
          <span>Data Fresh: Just now</span>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="hidden md:flex items-center space-x-2">
          {neo4jStatus === 'connected' ? (
            <span className="bg-green-500/20 text-green-500 border border-green-500/30 px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider flex items-center">
              <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
              Live Neo4j data
            </span>
          ) : neo4jStatus === 'error' ? (
            <span className="bg-red-500/20 text-red-500 border border-red-500/30 px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider flex items-center">
              <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>
              Neo4j unavailable
            </span>
          ) : null}
        </div>
        
        <button className="p-2 hover:bg-background rounded-md text-slate-400 hover:text-slate-100 relative">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full"></span>
        </button>
        
        <div className="flex items-center space-x-3 border-l border-border pl-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium leading-none">{user?.name}</p>
            <p className="text-xs text-muted capitalize mt-1">{user?.role}</p>
          </div>
          <button onClick={logout} className="p-1.5 bg-background border border-border rounded-full hover:bg-danger/20 hover:text-danger hover:border-danger/50 transition-colors" title="Logout">
            <UserIcon size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
