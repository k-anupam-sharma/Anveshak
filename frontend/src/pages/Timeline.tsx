import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { motion } from 'framer-motion';

export default function Timeline() {
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    fetch('http://localhost:8000/api/timeline')
      .then(r => r.json())
      .then(setEvents);
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <h1 className="text-3xl font-bold tracking-tight">Investigation Timeline</h1>
      
      <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent mt-8">
        {events.map((event, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={event.id} 
            className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-primary text-slate-900 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
               {event.type === 'COMMUNICATION' ? '📞' : '🚨'}
            </div>
            
            <Card className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 shadow">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline">{event.type}</Badge>
                <time className="text-xs font-mono text-muted">{new Date(event.date).toLocaleString()}</time>
              </div>
              <p className="text-sm font-medium text-slate-200">{event.description}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {event.entities.map((e: string) => (
                  <span key={e} className="text-xs bg-surface border border-border px-2 py-1 rounded text-slate-400">
                    {e}
                  </span>
                ))}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
