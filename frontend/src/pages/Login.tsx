import React, { useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Search, Network } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';
import { motion } from 'framer-motion';

const demoAccounts = [
  { role: 'Admin', email: 'admin@anveshak.demo', pass: 'Admin@123', desc: 'Full system oversight & pipelines' },
  { role: 'Investigator', email: 'investigator@anveshak.demo', pass: 'Investigator@123', desc: 'Case analysis & lead creation' },
  { role: 'Supervisor', email: 'supervisor@anveshak.demo', pass: 'Supervisor@123', desc: 'Lead verification & case assignment' }
];

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      if (!res.ok) throw new Error('Invalid credentials');
      
      const data = await res.json();
      login(data.token, data.user);
      navigate('/');
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Animated Elements */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary rounded-full blur-[128px]" />
      </div>
      
      <div className="z-10 w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-12 p-8 items-center">
        
        {/* Left Side Branding */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col space-y-6"
        >
          <div className="flex items-center space-x-3 text-primary">
            <Network size={48} />
            <h1 className="text-5xl font-bold tracking-tight text-slate-100">Anveshak</h1>
          </div>
          <p className="text-xl text-muted font-light">Evidence-led investigation intelligence.</p>
          <div className="inline-flex items-center space-x-2 bg-surface border border-border rounded-full px-4 py-1.5 w-max">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-accent"></span>
            </span>
            <span className="text-sm font-medium text-slate-300">Demo / Decision Support Only</span>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-8 opacity-80">
            <div className="flex items-center space-x-3 text-slate-400">
              <Search className="text-secondary" />
              <span>Entity Resolution</span>
            </div>
            <div className="flex items-center space-x-3 text-slate-400">
              <Network className="text-primary" />
              <span>Graph Traversal</span>
            </div>
            <div className="flex items-center space-x-3 text-slate-400">
              <Shield className="text-accent" />
              <span>Evidence Verification</span>
            </div>
          </div>
        </motion.div>

        {/* Right Side Login Form */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Card className="p-8 bg-surface/50 backdrop-blur-xl border-border/50">
            <h2 className="text-2xl font-semibold mb-6">System Access</h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Email Address</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted" />
                  <Input 
                    type="email" 
                    placeholder="Enter official email" 
                    className="pl-9" 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Password</label>
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
              {error && <p className="text-danger text-sm">{error}</p>}
              <Button type="submit" className="w-full mt-4" disabled={loading}>
                {loading ? 'Authenticating...' : 'Secure Login'}
              </Button>
            </form>

            <div className="mt-8 border-t border-border pt-6">
              <p className="text-xs text-muted mb-4 uppercase tracking-wider font-semibold">Demo Accounts</p>
              <div className="space-y-3">
                {demoAccounts.map((acc) => (
                  <div 
                    key={acc.role} 
                    onClick={() => { setEmail(acc.email); setPassword(acc.pass); }}
                    className="p-3 rounded-lg border border-border/50 bg-background/50 hover:bg-background cursor-pointer transition-colors group flex justify-between items-center"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-200 group-hover:text-primary transition-colors">{acc.role}</p>
                      <p className="text-xs text-muted">{acc.desc}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity text-xs h-7">
                      Use
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
