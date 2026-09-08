import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { useAuth } from '../lib/AuthContext';
import { Activity, AlertTriangle, Users, Database, ShieldAlert, Network, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useNavigate } from 'react-router-dom';

const ENTITY_COLORS: Record<string, string> = {
  Person: '#3b82f6',
  Phone: '#06b6d4',
  Vehicle: '#f97316',
  Location: '#22c55e',
  Case: '#a855f7',
  BankAccount: '#eab308',
  Organization: '#ec4899',
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch('http://localhost:8000/api/dashboard/stats')
      .then(r => r.json())
      .then(data => setStats(data))
      .catch(console.error);
  }, []);

  if (!stats) return <div className="p-8 animate-pulse text-muted">Loading dashboard data...</div>;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  // Build entity breakdown chart data
  const entityBreakdown = stats.entity_breakdown
    ? Object.entries(stats.entity_breakdown).map(([name, value]) => ({
        name,
        count: value as number,
        color: ENTITY_COLORS[name] || '#64748b',
      }))
    : [];

  const topConnectors = stats.top_connectors || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome, {user?.name}</h1>
        <p className="text-muted mt-2">Here is the latest intelligence overview.</p>
      </div>

      <motion.div variants={container} initial="hidden" animate="show" className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        
        <motion.div variants={item}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted">Total Cases</CardTitle>
              <Activity className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_cases.toLocaleString()}</div>
              <p className="text-xs text-muted mt-1">+14 this week</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted">Graph Entities</CardTitle>
              <Database className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_entities.toLocaleString()}</div>
              <p className="text-xs text-muted mt-1">{stats.total_edges.toLocaleString()} relationships</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted">Active Leads</CardTitle>
              <AlertTriangle className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-accent mt-1">12 require supervisor review</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted">Data Quality</CardTitle>
              <ShieldAlert className="h-4 w-4 text-danger" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-danger">{stats.data_quality_warnings} Warnings</div>
              <p className="text-xs text-muted mt-1">Bronze to Silver pipeline</p>
            </CardContent>
          </Card>
        </motion.div>

      </motion.div>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2 mt-6">
        
        {/* Entity Breakdown Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="min-h-[340px]">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Entity Breakdown
              </CardTitle>
              <button
                onClick={() => navigate('/network')}
                className="text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
              >
                <Network className="h-3 w-3" />
                View Network
              </button>
            </CardHeader>
            <CardContent>
              {entityBreakdown.length > 0 ? (
                <ResponsiveContainer width="100%" height={230}>
                  <BarChart data={entityBreakdown} barCategoryGap="20%">
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        color: '#f1f5f9',
                        fontSize: '12px',
                      }}
                      cursor={{ fill: 'rgba(148, 163, 184, 0.05)' }}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {entityBreakdown.map((entry, i) => (
                        <Cell key={`cell-${i}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center text-muted h-48">
                  No entity data available
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* High Value Connectors */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Card className="min-h-[340px]">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-4 w-4 text-secondary" />
                High Value Connectors
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topConnectors.length > 0 ? (
                <div className="space-y-4">
                  {topConnectors.map((connector: any, i: number) => {
                    const maxConnections = topConnectors[0]?.connections || 1;
                    const percentage = (connector.connections / maxConnections) * 100;
                    return (
                      <div key={connector.id} className="group">
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-primary/70 w-5">{`#${i + 1}`}</span>
                            <span className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">
                              {connector.name}
                            </span>
                          </div>
                          <span className="text-xs font-mono text-muted">
                            {connector.connections} links
                          </span>
                        </div>
                        <div className="w-full bg-background rounded-full h-2 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ delay: 0.7 + i * 0.1, duration: 0.5, ease: 'easeOut' }}
                            className="h-full rounded-full"
                            style={{
                              background: `linear-gradient(90deg, ${ENTITY_COLORS.Person}, ${ENTITY_COLORS.Phone})`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                  <div className="pt-2 border-t border-border/50">
                    <p className="text-[11px] text-muted italic">
                      Entities with the most connections across the investigation network. 
                      High-value connectors often bridge separate criminal clusters.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center text-muted h-48">
                  No connector data available
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

    </div>
  );
}
