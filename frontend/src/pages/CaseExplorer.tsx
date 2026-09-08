import React, { useEffect, useState, useRef } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, Map, GitMerge, FileSearch, Search, Loader2, AlertCircle } from 'lucide-react';

const nodeColors: Record<string, string> = {
  Person: '#3b82f6', // blue
  Phone: '#06b6d4', // cyan
  Vehicle: '#f97316', // orange
  Location: '#22c55e', // green
  Case: '#a855f7', // purple
  BankAccount: '#eab308', // yellow
};

const cytoscapeStylesheet: any = [
  {
    selector: 'node',
    style: {
      'background-color': (ele: any) => nodeColors[ele.data('label')] || '#64748b',
      'label': 'data(label)',
      'color': '#fff',
      'text-valign': 'center',
      'text-halign': 'center',
      'font-size': '10px',
      'text-outline-width': 1,
      'text-outline-color': '#0f172a',
      'width': 40,
      'height': 40,
      'border-width': 2,
      'border-color': '#1e293b'
    }
  },
  {
    selector: 'edge',
    style: {
      'width': 2,
      'line-color': '#334155',
      'target-arrow-color': '#334155',
      'target-arrow-shape': 'triangle',
      'curve-style': 'bezier',
      'label': 'data(label)',
      'font-size': '8px',
      'color': '#94a3b8',
      'text-background-opacity': 1,
      'text-background-color': '#0f172a',
      'text-background-padding': 2,
      'text-background-shape': 'roundrectangle'
    }
  },
  {
    selector: '.highlighted',
    style: {
      'line-color': '#06b6d4',
      'target-arrow-color': '#06b6d4',
      'width': 4,
      'z-index': 10
    }
  }
];

export default function CaseExplorer() {
  const [elements, setElements] = useState<any[]>([]);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [explaining, setExplaining] = useState(false);
  const [explainData, setExplainData] = useState<any>(null);
  const cyRef = useRef<any>(null);

  const fetchGraph = (entityId: string) => {
    setIsLoading(true);
    setError(null);
    setElements([]);
    setSelectedNode(null);
    setExplainData(null);

    fetch(`http://localhost:8000/api/graph/entity/${entityId}`)
      .then(res => {
        if (!res.ok) throw new Error('Neo4j connection failed. Live graph data is unavailable.');
        return res.json();
      })
      .then(data => {
        if (data.length === 0) {
          setError('No neighborhood found for this Entity ID.');
        } else {
          setElements(data);
          if (cyRef.current) {
            setTimeout(() => {
                cyRef.current.layout({ name: 'cose', animate: true }).run();
            }, 100);
          }
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setIsLoading(false));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      fetchGraph(searchQuery.trim());
    }
  };

  const handleExplainConnection = () => {
    setExplaining(true);
    fetch('http://localhost:8000/api/connections/explain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source_id: searchQuery, target_id: selectedNode?.id })
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setExplainData(data);
        // Highlight path edges in graph if Cy instance is available
        if (cyRef.current && data.path) {
           cyRef.current.edges().removeClass('highlighted');
           // Very simplified highlighting logic for demo
           data.path.forEach((p: any) => {
               if(p.relationship) {
                  cyRef.current.edges(`[label = "${p.relationship}"]`).addClass('highlighted');
               }
           });
        }
      })
      .catch(err => console.error("Explain error:", err))
      .finally(() => setExplaining(false));
  };

  useEffect(() => {
    if (cyRef.current) {
      cyRef.current.on('tap', 'node', (evt: any) => {
        const node = evt.target;
        setSelectedNode(node.data());
      });
      cyRef.current.on('tap', (evt: any) => {
        if (evt.target === cyRef.current) {
          setSelectedNode(null);
        }
      });
    }
  }, [elements]);

  return (
    <div className="h-full flex flex-col space-y-4 relative">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Graph Explorer</h1>
        <Badge variant="outline" className="border-primary text-primary">Neo4j Aura Live</Badge>
      </div>

      <div className="flex-1 flex gap-4 min-h-0">
        
        {/* Main Graph Area */}
        <Card className="flex-1 overflow-hidden relative border-border/50 bg-background/50 flex flex-col">
          
          <div className="p-4 border-b border-border/50 bg-surface/50">
             <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter Name, Phone, Vehicle, or ID" 
                  className="flex-1 bg-background border border-border rounded px-3 py-2 text-sm text-slate-200"
                />
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                </Button>
             </form>
          </div>

          <div className="flex-1 relative">
            {error && (
                <div className="absolute inset-0 flex items-center justify-center flex-col text-danger bg-background/80 z-20">
                    <AlertCircle className="h-12 w-12 mb-4 opacity-80" />
                    <p>{error}</p>
                </div>
            )}

            {!isLoading && elements.length === 0 && !error && (
                <div className="absolute inset-0 flex items-center justify-center text-muted flex-col">
                    <Search className="h-12 w-12 mb-4 opacity-20" />
                    <p>Enter an Entity ID to load its neighborhood.</p>
                </div>
            )}

            {elements.length > 0 && (
                <CytoscapeComponent
                    elements={elements}
                    style={{ width: '100%', height: '100%' }}
                    stylesheet={cytoscapeStylesheet}
                    cy={(cy) => { cyRef.current = cy; }}
                />
            )}

            <div className="absolute bottom-4 left-4 z-10 pointer-events-none">
                <div className="bg-surface/80 backdrop-blur border border-border p-3 rounded-lg space-y-2 pointer-events-auto">
                <h4 className="text-sm font-semibold mb-2 text-slate-200">Legend</h4>
                {Object.entries(nodeColors).map(([label, color]) => (
                    <div key={label} className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
                    <span className="text-xs text-muted">{label}</span>
                    </div>
                ))}
                </div>
            </div>
          </div>
        </Card>

        {/* Right Drawer (Entity Details) */}
        <AnimatePresence>
          {selectedNode && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 350, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="h-full shrink-0"
            >
              <Card className="h-full overflow-y-auto border-l border-primary/20 bg-surface">
                <CardHeader className="bg-surface border-b border-border sticky top-0 backdrop-blur z-10">
                  <div className="flex justify-between items-start">
                    <div>
                      <Badge style={{ backgroundColor: nodeColors[selectedNode.label] || '#64748b' }} className="mb-2 text-white border-transparent">
                        {selectedNode.label}
                      </Badge>
                      <CardTitle className="text-lg">{selectedNode.properties?.name || selectedNode.properties?.fir_number || selectedNode.id}</CardTitle>
                    </div>
                    <button onClick={() => setSelectedNode(null)} className="text-muted hover:text-slate-100">×</button>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  
                  <div>
                    <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Properties</h4>
                    <div className="space-y-2">
                      {selectedNode.properties && Object.entries(selectedNode.properties).map(([k, v]) => (
                        <div key={k} className="flex justify-between border-b border-border/50 pb-1 gap-4">
                          <span className="text-sm text-slate-400 capitalize shrink-0">{k.replace('_', ' ')}</span>
                          <span className="text-sm font-medium text-slate-200 text-right truncate">
                            {String(v)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 space-y-3">
                    <Button className="w-full justify-start" variant="secondary" onClick={() => { setSearchQuery(selectedNode.id); fetchGraph(selectedNode.id); }}>
                      <Map className="mr-2 h-4 w-4" /> Focus on Neighborhood
                    </Button>
                    <Button className="w-full justify-start" variant="outline" onClick={handleExplainConnection} disabled={explaining || !searchQuery}>
                      {explaining ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GitMerge className="mr-2 h-4 w-4" />}
                      Explain Path to Source
                    </Button>
                  </div>

                  {explainData && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 p-4 bg-primary/10 border border-primary/30 rounded-lg">
                      <h4 className="text-sm font-semibold text-primary flex items-center mb-2">
                        <Info className="mr-2 h-4 w-4" /> Connection Explanation
                      </h4>
                      <p className="text-xs text-slate-300 leading-relaxed mb-3 font-medium">
                        {explainData.explanation}
                      </p>
                      
                      {explainData.path && explainData.path.length > 0 && (
                          <div className="space-y-2 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-primary/30 before:to-transparent mt-4">
                            {explainData.path.map((step: any, i: number) => (
                              <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                <div className="flex items-center justify-center w-4 h-4 rounded-full border border-primary bg-background text-primary shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 ml-0.5"></div>
                                <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] p-2 rounded border border-border bg-surface text-xs shadow-sm">
                                    {step.entity ? <span className="font-semibold text-slate-200">{step.entity}</span> : <span className="text-cyan-400 italic">{step.relationship}</span>}
                                    {step.evidence && <div className="text-[10px] text-muted mt-1 break-all">Ref: {step.evidence}</div>}
                                </div>
                              </div>
                            ))}
                          </div>
                      )}
                    </motion.div>
                  )}

                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
