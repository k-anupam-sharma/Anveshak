import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useAuth } from '../lib/AuthContext';
import { Check, X, Eye } from 'lucide-react';

export default function Leads() {
  const [leads, setLeads] = useState<any[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    fetch('http://localhost:8000/api/leads')
      .then(r => r.json())
      .then(setLeads);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytical Leads</h1>
          <p className="text-muted mt-2">These are automated analytical leads and require investigator verification.</p>
        </div>
      </div>

      <div className="grid gap-6">
        {leads.map(lead => (
          <Card key={lead.id} className="overflow-hidden border-l-4 border-l-accent">
            <CardHeader className="bg-surface/50 pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <Badge variant="warning">High Priority</Badge>
                    <Badge variant="outline">{lead.status}</Badge>
                    <span className="text-xs text-muted font-mono">{lead.id}</span>
                  </div>
                  <CardTitle className="text-xl">{lead.title}</CardTitle>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted mb-1">Created</div>
                  <div className="text-sm">{new Date(lead.created_date).toLocaleDateString()}</div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-slate-300 leading-relaxed mb-6">
                {lead.explanation}
              </p>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h5 className="text-xs font-semibold uppercase text-muted mb-2">Related Entities</h5>
                  <div className="flex flex-wrap gap-2">
                    {lead.related_entities.map((e: string) => (
                      <span key={e} className="text-xs bg-background border border-border px-2 py-1 rounded text-slate-400">
                        {e}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h5 className="text-xs font-semibold uppercase text-muted mb-2">Related Cases</h5>
                  <div className="flex flex-wrap gap-2">
                    {lead.related_cases.map((c: string) => (
                      <span key={c} className="text-xs bg-background border border-border px-2 py-1 rounded text-slate-400">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-border pt-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted">Confidence Score:</span>
                  <span className="text-sm font-bold text-primary">{Math.round(lead.confidence * 100)}%</span>
                </div>
                
                <div className="flex space-x-3">
                  <Button variant="outline" size="sm">
                    <Eye className="mr-2 h-4 w-4" /> Visualize
                  </Button>
                  
                  {user?.role === 'supervisor' && lead.status === 'Unreviewed' && (
                    <>
                      <Button variant="danger" size="sm">
                        <X className="mr-2 h-4 w-4" /> Reject
                      </Button>
                      <Button variant="secondary" size="sm" className="bg-green-600 hover:bg-green-700">
                        <Check className="mr-2 h-4 w-4" /> Verify Lead
                      </Button>
                    </>
                  )}
                  {user?.role === 'investigator' && lead.status === 'Unreviewed' && (
                    <Button variant="default" size="sm">
                      Submit for Review
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
