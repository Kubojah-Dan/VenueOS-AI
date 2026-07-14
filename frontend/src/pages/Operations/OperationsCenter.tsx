import React, { useState } from 'react';
import { useApp } from '../../app/providers';
import {
  AlertTriangle,
  Plus,
  Shield,
  Activity,
  CheckCircle,
  Users,
  MapPin,
  Clock,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export const OperationsCenter: React.FC = () => {
  const { role, incidents, addIncidentLocal, triggerRefresh } = useApp();
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // New incident form states
  const [category, setCategory] = useState<'Security' | 'Medical' | 'Facilities' | 'Crowds' | 'Transport'>('Security');
  const [severity, setSeverity] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('MEDIUM');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');

  const activeIncidents = incidents.filter((i) => i.status !== 'RESOLVED');
  const resolvedIncidents = incidents.filter((i) => i.status === 'RESOLVED');

  const handleReportIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location || !description) return;

    const payload = {
      category,
      severity,
      location,
      description,
      coordinates: { x: 25.4208 + (Math.random() - 0.5) * 0.005, y: 51.4886 + (Math.random() - 0.5) * 0.005 }
    };

    try {
      const res = await fetch('http://localhost:3001/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        addIncidentLocal(data);
        setIsReportModalOpen(false);
        setLocation('');
        setDescription('');
        triggerRefresh();
      }
    } catch (err) {
      console.warn('Network offline. Logging locally...');
      const fallbackData = {
        id: `inc-local-${Date.now()}`,
        ...payload,
        status: 'REPORTED' as const,
        reportedAt: new Date().toISOString(),
        assignedTeam: 'Unassigned Patrol',
        actions: 'Logged offline.'
      };
      addIncidentLocal(fallbackData);
      setIsReportModalOpen(false);
    }
  };

  const handleResolveIncident = async (id: string) => {
    try {
      const res = await fetch('http://localhost:3001/api/incidents/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, actions: 'Resolved by operations supervisor.' })
      });
      if (res.ok) {
        triggerRefresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const volunteersList = [
    { id: 'vol-801', name: 'Maria Santos', section: 'Section 102', status: 'ON_DUTY' },
    { id: 'vol-802', name: 'James Carter', section: 'Gate A Entrance', status: 'ON_DUTY' },
    { id: 'vol-803', name: 'Yusuf Al-Jamil', section: 'Food Court FC-1', status: 'BREAK' },
    { id: 'vol-804', name: 'Yuki Tanaka', section: 'Gate C Entry', status: 'ON_DUTY' }
  ];

  return (
    <div className="space-y-6 font-sans">
      
      {/* OPERATIONS SUBHEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center premium-card p-4.5 gap-4">
        <div>
          <h2 className="text-base font-bold text-gray-800 dark:text-white">Incident Dispatch & Resource Management</h2>
          <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold">Assign responder teams, view live logs, and execute automated RAG workflows</p>
        </div>
        
        {role !== 'Fan' && (
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="flex items-center space-x-2 px-3 py-2 bg-forest-500 hover:bg-forest-600 text-white rounded-full text-xs font-bold shadow-premium transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create Dispatch Ticket</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COL 1 & 2: INCIDENTS LOG */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* ACTIVE LOG LIST */}
          <div className="premium-card p-4.5 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-gray-700 dark:text-white uppercase tracking-wider">Active Command Tickets ({activeIncidents.length})</h3>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            
            <div className="space-y-4">
              {activeIncidents.length === 0 ? (
                <div className="text-center py-8 text-xs text-gray-400 space-y-2 border border-dashed border-gray-250 dark:border-graphite-800 rounded-xl">
                  <CheckCircle className="w-7 h-7 text-emerald-500 mx-auto" />
                  <p className="font-semibold text-gray-700 dark:text-gray-300">All sectors reported normal</p>
                  <p className="text-[10px] text-gray-500">No active incidents require dispatcher response</p>
                </div>
              ) : (
                activeIncidents.map((inc) => {
                  let severityColor = 'border-l-blue-500 text-blue-500 bg-blue-500/5';
                  if (inc.severity === 'CRITICAL') severityColor = 'border-l-red-500 text-red-500 bg-red-500/5';
                  if (inc.severity === 'HIGH') severityColor = 'border-l-amber-500 text-amber-500 bg-amber-500/5';

                  return (
                    <div
                      key={inc.id}
                      className={`p-3.5 border-y border-r border-l-4 border-gray-150 dark:border-graphite-850 rounded-xl space-y-3 hover:shadow-premium transition-all ${severityColor}`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                            inc.severity === 'CRITICAL' ? 'bg-red-500/10' : inc.severity === 'HIGH' ? 'bg-amber-500/10' : 'bg-blue-500/10'
                          }`}>
                            {inc.severity}
                          </span>
                          <span className="text-xs font-bold text-gray-805 dark:text-gray-200">
                            {inc.category} Dispatch Alert
                          </span>
                        </div>
                        <span className="text-[10px] text-gray-400 font-semibold">{new Date(inc.reportedAt).toLocaleTimeString()}</span>
                      </div>

                      <p className="text-xs text-gray-650 dark:text-gray-300 font-semibold leading-relaxed">{inc.description}</p>
                      
                      <div className="grid grid-cols-2 gap-4 text-[10px] text-gray-450 font-bold border-t border-gray-150/40 dark:border-graphite-850/50 pt-2.5">
                        <span className="flex items-center space-x-1.5"><MapPin className="w-3.5 h-3.5 text-gray-400" /><span>Loc: <span className="text-gray-700 dark:text-gray-300 font-bold">{inc.location}</span></span></span>
                        <span className="flex items-center space-x-1.5"><Shield className="w-3.5 h-3.5 text-gray-400" /><span>Team: <span className="text-gray-700 dark:text-gray-300 font-bold">{inc.assignedTeam}</span></span></span>
                      </div>

                      {role !== 'Fan' && (
                        <div className="pt-2 flex justify-end">
                          <button
                            onClick={() => handleResolveIncident(inc.id)}
                            className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-500 rounded-md text-[10px] font-bold transition-all border border-emerald-500/15"
                          >
                            Close Ticket
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* RESOLVED LOGS */}
          <div className="premium-card p-4.5 space-y-4">
            <h3 className="text-xs font-bold text-gray-700 dark:text-white uppercase tracking-wider">Closed Archives ({resolvedIncidents.length})</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {resolvedIncidents.map((inc) => (
                <div key={inc.id} className="p-2.5 bg-gray-55/50 dark:bg-graphite-850/50 border border-gray-150/30 dark:border-graphite-800/30 rounded-xl flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-gray-700 dark:text-gray-300 block">{inc.description}</span>
                    <span className="text-[10px] text-gray-400 font-semibold">Resolution log: {inc.actions}</span>
                  </div>
                  <span className="px-2 py-0.5 bg-gray-100 dark:bg-graphite-800 text-gray-400 dark:text-gray-500 rounded-full text-[9px] font-extrabold tracking-wider">
                    ARCHIVED
                  </span>
                </div>
              ))}
              {resolvedIncidents.length === 0 && (
                <span className="text-xs text-gray-400 block text-center py-4">No logged archiving history.</span>
              )}
            </div>
          </div>

        </div>

        {/* COL 3: VOLUNTEERS & AI OPERATIONS BRIEFINGS */}
        <div className="space-y-6">
          
          {/* AI OPERATIONS RECOMMENDATIONS */}
          <div className="bg-forest-950 text-white border border-forest-800 rounded-xl p-4.5 shadow-premium space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-forest-900/40 rounded-full filter blur-xl"></div>
            
            <div className="relative z-10 space-y-3">
              <div className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[9px] uppercase font-bold text-forest-200 tracking-wider">Active Decision Support</span>
              </div>
              <h4 className="font-bold text-xs text-white">Suggested Mitigation Workflows</h4>
              
              <div className="space-y-3 text-xs text-forest-100 font-medium">
                {activeIncidents.some(i => i.category === 'Crowds') ? (
                  <div className="p-3 bg-forest-900/50 border border-forest-800 rounded-lg space-y-1">
                    <p className="font-bold text-white text-[10px]">Crowd Congestion RAG Mitigation</p>
                    <p className="text-[9.5px] text-forest-200 leading-relaxed font-semibold">
                      Deploy 2 volunteer groups from Gate C to auxiliary checkpoints Gate A-2 to balance crowd inflows and expedite manual scan tickets.
                    </p>
                  </div>
                ) : null}

                {activeIncidents.some(i => i.category === 'Medical') ? (
                  <div className="p-3 bg-forest-900/50 border border-forest-800 rounded-lg space-y-1">
                    <p className="font-bold text-white text-[10px]">Medical Response RAG Protocol</p>
                    <p className="text-[9.5px] text-forest-200 leading-relaxed font-semibold">
                      Respond unit is on-site. Instruct volunteer team at Section 102 to distribute backup mineral water cases to spectators in seats block.
                    </p>
                  </div>
                ) : null}

                {activeIncidents.length === 0 ? (
                  <p className="text-[9.5px] leading-relaxed text-forest-200">
                    Console nominal. Adjust air-cooling loops in Sector West to load-balance current draw.
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          {/* VOLUNTEER TRACKING TABLE */}
          <div className="premium-card p-4.5 space-y-4">
            <h3 className="text-xs font-bold text-gray-700 dark:text-white uppercase tracking-wider">Active Staff Roster ({volunteersList.length})</h3>
            <div className="space-y-2">
              {volunteersList.map((vol) => (
                <div key={vol.id} className="flex justify-between items-center text-xs p-2.5 border border-gray-150/15 dark:border-graphite-850 hover:bg-gray-50/50 dark:hover:bg-graphite-850/50 rounded-xl">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-7.5 h-7.5 bg-forest-500/10 text-forest-500 dark:text-forest-400 rounded-full flex items-center justify-center font-extrabold text-[10px] border border-forest-500/10">
                      {vol.name.split(' ').map(n=>n[0]).join('')}
                    </div>
                    <div>
                      <span className="font-bold text-gray-700 dark:text-gray-305 block">{vol.name}</span>
                      <span className="text-[9px] text-gray-400 font-semibold">{vol.section}</span>
                    </div>
                  </div>
                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold ${
                    vol.status === 'ON_DUTY'
                      ? 'bg-emerald-500/10 text-emerald-600'
                      : 'bg-amber-500/10 text-amber-500'
                  }`}>
                    {vol.status.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* NEW INCIDENT REPORT DIALOG */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-graphite-900 border border-gray-200 dark:border-graphite-800 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 text-sm animate-fadeIn">
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-graphite-850 pb-2">
              <span className="text-base font-bold text-gray-800 dark:text-white">Create Operations Incident Ticket</span>
              <button 
                onClick={() => setIsReportModalOpen(false)} 
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-250 font-black text-sm p-1.5"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleReportIncident} className="space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-white dark:bg-graphite-950 border border-gray-200 dark:border-graphite-850 p-2.5 rounded-lg text-sm text-gray-850 dark:text-gray-200 focus:ring-1 focus:ring-forest-500"
                  >
                    <option value="Security">Security Patrol</option>
                    <option value="Medical">Medical Response</option>
                    <option value="Facilities">Facilities Maintenance</option>
                    <option value="Crowds">Crowd Logistics</option>
                    <option value="Transport">Transit Operations</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Severity</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as any)}
                    className="w-full bg-white dark:bg-graphite-950 border border-gray-200 dark:border-graphite-850 p-2.5 rounded-lg text-sm text-gray-850 dark:text-gray-200 focus:ring-1 focus:ring-forest-500"
                  >
                    <option value="LOW">Low (Log only)</option>
                    <option value="MEDIUM">Medium (Local dispatch)</option>
                    <option value="HIGH">High (Priority deploy)</option>
                    <option value="CRITICAL">Critical (Immediate sirens)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Target Location</label>
                <input
                  type="text"
                  placeholder="e.g. Block 102 Row F, Gate A Entry area"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-white dark:bg-graphite-950 border border-gray-200 dark:border-graphite-850 p-2.5 rounded-lg text-sm text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Situation Description</label>
                <textarea
                  placeholder="Summarize the incident and required response resources..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-white dark:bg-graphite-950 border border-gray-200 dark:border-graphite-850 p-2.5 rounded-lg text-sm text-gray-900 dark:text-white h-24 focus:ring-1 focus:ring-forest-500"
                  required
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(false)}
                  className="px-4 py-2 border border-gray-250 dark:border-graphite-850 rounded-lg text-sm text-gray-500 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-forest-500 text-white rounded-lg text-sm font-bold shadow-premium hover:bg-forest-600 transition-all"
                >
                  Broadcast Ticket
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
export default OperationsCenter;
