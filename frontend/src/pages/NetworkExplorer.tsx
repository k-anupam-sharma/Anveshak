import React, { useEffect, useState, useRef, useCallback } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ZoomIn, ZoomOut, Maximize, Loader2, Network, X, Map, GitMerge,
  Users, Phone, Car, MapPin, Briefcase, Building2, Landmark, AlertCircle
} from 'lucide-react';

// ... (skipping constants)

export default function NetworkExplorer() {
  const [elements, setElements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [nodeCounts, setNodeCounts] = useState<Record<string, number>>({});
  const cyRef = useRef<cytoscape.Core | null>(null);

  // Fetch full graph on mount
  useEffect(() => {
    setIsLoading(true);
    setError(null);
    fetch('http://localhost:8000/api/graph/full')
      .then(res => {
        if (!res.ok) throw new Error("Neo4j connection failed. Live graph data is unavailable.");
        return res.json();
      })
      .then(data => {
        setElements(data);
        // Count nodes by label
        const counts: Record<string, number> = {};
        data.forEach((el: any) => {
          if (el.data && !el.data.source) {
            const label = el.data.label || 'Unknown';
            counts[label] = (counts[label] || 0) + 1;
          }
        });
        setNodeCounts(counts);
      })
      .catch(err => {
        console.error(err);
        setError("Neo4j connection failed. Live graph data is unavailable.");
      })
      .finally(() => setIsLoading(false));
  }, []);

  // Set up Cytoscape event handlers
  const handleCyInit = useCallback((cy: cytoscape.Core) => {
    cyRef.current = cy;

    cy.on('tap', 'node', (evt) => {
      const node = evt.target;
      setSelectedNode(node.data());

      // Highlight clicked node and its neighbors
      cy.elements().removeClass('highlighted-node neighbor highlighted-edge dimmed');
      cy.elements().addClass('dimmed');
      node.removeClass('dimmed').addClass('highlighted-node');
      const neighborhood = node.neighborhood();
      neighborhood.nodes().removeClass('dimmed').addClass('neighbor');
      neighborhood.edges().removeClass('dimmed').addClass('highlighted-edge');
    });

    cy.on('tap', (evt) => {
      if (evt.target === cy) {
        setSelectedNode(null);
        cy.elements().removeClass('highlighted-node neighbor highlighted-edge dimmed');
      }
    });

    // Run concentric layout after a short delay for DOM readiness
    setTimeout(() => {
      cy.layout({
        name: 'concentric',
        concentric: (node: any) => {
          // Place high-degree nodes in center
          return node.degree();
        },
        levelWidth: () => 3,
        minNodeSpacing: 8,
        animate: false,
        padding: 60,
      } as any).run();

      cy.fit(undefined, 50);
    }, 100);
  }, []);

  const handleZoomIn = () => {
    if (cyRef.current) {
      cyRef.current.zoom(cyRef.current.zoom() * 1.3);
    }
  };

  const handleZoomOut = () => {
    if (cyRef.current) {
      cyRef.current.zoom(cyRef.current.zoom() * 0.7);
    }
  };

  const handleFit = () => {
    if (cyRef.current) {
      cyRef.current.fit(undefined, 50);
    }
  };

  const handleFocusNode = (nodeId: string) => {
    if (cyRef.current) {
      const node = cyRef.current.$(`#${nodeId}`);
      if (node.length > 0) {
        cyRef.current.animate({
          center: { eles: node },
          zoom: cyRef.current.zoom() * 1.5,
        } as any, { duration: 400 });

        // Trigger click behavior
        cyRef.current.elements().removeClass('highlighted-node neighbor highlighted-edge dimmed');
        cyRef.current.elements().addClass('dimmed');
        node.removeClass('dimmed').addClass('highlighted-node');
        const neighborhood = node.neighborhood();
        neighborhood.nodes().removeClass('dimmed').addClass('neighbor');
        neighborhood.edges().removeClass('dimmed').addClass('highlighted-edge');
        setSelectedNode(node.data());
      }
    }
  };

  const totalNodes = Object.values(nodeCounts).reduce((a, b) => a + b, 0);
  const totalEdges = elements.filter((el: any) => el.data?.source).length;

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold tracking-tight">Network Explorer</h1>
          <Badge variant="outline" className="border-primary text-primary">
            <Network className="mr-1.5 h-3 w-3" />
            {totalNodes} Nodes · {totalEdges} Edges
          </Badge>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* Graph canvas */}
        <Card className="flex-1 overflow-hidden relative border-border/50 bg-[#0a0f1a]">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#0a0f1a] z-30">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-sm text-muted">Loading investigation network…</p>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center flex-col text-danger bg-background/80 z-20">
              <AlertCircle className="h-12 w-12 mb-4 opacity-80" />
              <p>{error}</p>
            </div>
          )}

          {!isLoading && !error && elements.length > 0 && (
            <CytoscapeComponent
              elements={elements}
              style={{ width: '100%', height: '100%', background: '#0a0f1a' }}
              stylesheet={cytoscapeStylesheet}
              cy={handleCyInit}
              minZoom={0.2}
              maxZoom={5}
              wheelSensitivity={0.3}
            />
          )}

          {/* Legend — bottom left */}
          <div className="absolute bottom-4 left-4 z-10">
            <div className="bg-surface/80 backdrop-blur-md border border-border/60 p-3 rounded-lg">
              <h4 className="text-[10px] font-semibold mb-2 text-slate-400 uppercase tracking-widest">Legend</h4>
              <div className="grid grid-cols-2 gap-x-5 gap-y-1.5">
                {Object.entries(NODE_COLORS).map(([label, color]) => {
                  const Icon = NODE_ICONS[label];
                  return (
                    <button
                      key={label}
                      className="flex items-center gap-1.5 group cursor-pointer hover:opacity-100 opacity-70 transition-opacity"
                      onClick={() => {
                        // Find first node of this type and focus
                        const el = elements.find((e: any) => e.data?.label === label && !e.data?.source);
                        if (el) handleFocusNode(el.data.id);
                      }}
                    >
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                      {Icon && <Icon className="h-3 w-3 text-slate-400" />}
                      <span className="text-[10px] text-slate-400 group-hover:text-slate-200 transition-colors">
                        {label} {nodeCounts[label] ? `(${nodeCounts[label]})` : ''}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Zoom controls — bottom right */}
          <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-1.5">
            <button
              onClick={handleZoomIn}
              className="p-2 bg-surface/80 backdrop-blur-md border border-border/60 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-surface transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-2 bg-surface/80 backdrop-blur-md border border-border/60 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-surface transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <button
              onClick={handleFit}
              className="p-2 bg-surface/80 backdrop-blur-md border border-border/60 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-surface transition-colors"
              title="Fit to View"
            >
              <Maximize className="h-4 w-4" />
            </button>
          </div>
        </Card>

        {/* Detail panel */}
        <AnimatePresence>
          {selectedNode && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 350, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="h-full shrink-0"
            >
              <Card className="h-full overflow-y-auto border-l border-primary/20 bg-surface">
                <CardHeader className="bg-surface border-b border-border sticky top-0 backdrop-blur z-10">
                  <div className="flex justify-between items-start">
                    <div>
                      <Badge
                        style={{ backgroundColor: NODE_COLORS[selectedNode.label] || '#64748b' }}
                        className="mb-2 text-white border-transparent"
                      >
                        {selectedNode.label}
                      </Badge>
                      <CardTitle className="text-lg">
                        {selectedNode.properties?.name || selectedNode.properties?.number || selectedNode.properties?.registration || selectedNode.properties?.fir_number || selectedNode.properties?.address || selectedNode.properties?.account_no || selectedNode.id}
                      </CardTitle>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedNode(null);
                        if (cyRef.current) {
                          cyRef.current.elements().removeClass('highlighted-node neighbor highlighted-edge dimmed');
                        }
                      }}
                      className="text-muted hover:text-slate-100 p-1"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  {/* Properties */}
                  <div>
                    <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Properties</h4>
                    <div className="space-y-2">
                      {selectedNode.properties && Object.entries(selectedNode.properties).map(([k, v]) => (
                        <div key={k} className="flex justify-between border-b border-border/50 pb-1 gap-4">
                          <span className="text-sm text-slate-400 capitalize shrink-0">{k.replace(/_/g, ' ')}</span>
                          <span className="text-sm font-medium text-slate-200 text-right truncate">
                            {v != null ? String(v) : '—'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 space-y-3">
                    <Button
                      className="w-full justify-start"
                      variant="secondary"
                      onClick={() => handleFocusNode(selectedNode.id)}
                    >
                      <Map className="mr-2 h-4 w-4" /> Focus on Node
                    </Button>
                    <Button
                      className="w-full justify-start"
                      variant="outline"
                      onClick={() => {
                        window.location.href = `/cases?search=${selectedNode.id}`;
                      }}
                    >
                      <GitMerge className="mr-2 h-4 w-4" /> Explore in Case Graph
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
