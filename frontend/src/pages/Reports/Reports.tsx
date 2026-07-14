import React, { useState } from 'react';
import { useApp } from '../../app/providers';
import { FileText, Download, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';

export const Reports: React.FC = () => {
  const { crowd, sustainability, incidents } = useApp();
  const [exportingId, setExportingId] = useState<string | null>(null);

  const reportItems = [
    { id: 'rep-001', name: 'Crowd Ingress & Gate Inflow Audit', date: 'July 14, 2026', size: '2.4 MB', category: 'Crowds' },
    { id: 'rep-002', name: 'Smart Power Grid & Solar Offset Report', date: 'July 14, 2026', size: '1.8 MB', category: 'Sustainability' },
    { id: 'rep-003', name: 'Incident Dispatch & Medical Log Archives', date: 'July 13, 2026', size: '4.2 MB', category: 'Security' },
    { id: 'rep-004', name: 'FIFA World Cup VIP Transit Ingress Audit', date: 'July 12, 2026', size: '3.1 MB', category: 'Transport' }
  ];

  const handleDownload = (id: string, name: string) => {
    setExportingId(id);
    setTimeout(() => {
      setExportingId(null);
      alert(`Report "${name}" exported successfully. Check your browser downloads folder.`);
    }, 2000);
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* REPORTS SUBHEADER */}
      <div className="flex justify-between items-center bg-white dark:bg-graphite-900 p-4 rounded-xl border border-gray-150 dark:border-graphite-800 shadow-premium">
        <div>
          <h2 className="text-base font-bold text-gray-800 dark:text-white">Tournament Operations Shift Audit Reports</h2>
          <p className="text-xs text-gray-400 font-medium">Export raw database records or read automated AI executive summaries</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* EXECUTIVE REPORT LIST */}
        <div className="lg:col-span-2 bg-white dark:bg-graphite-900 border border-gray-150 dark:border-graphite-800 rounded-xl p-5 shadow-premium space-y-4">
          <div className="flex items-center space-x-2">
            <FileText className="w-4.5 h-4.5 text-forest-500" />
            <h3 className="text-xs font-bold text-gray-700 dark:text-white uppercase tracking-wider">Historical Audit Logs</h3>
          </div>

          <div className="divide-y divide-gray-150 dark:divide-graphite-800">
            {reportItems.map((rep) => (
              <div key={rep.id} className="py-3.5 flex justify-between items-center text-xs">
                <div className="space-y-0.5">
                  <span className="font-bold text-gray-850 dark:text-gray-200 block">{rep.name}</span>
                  <span className="text-[10px] text-gray-400 font-semibold">
                    Date: {rep.date} • Size: {rep.size} • Category: {rep.category}
                  </span>
                </div>
                
                <button
                  onClick={() => handleDownload(rep.id, rep.name)}
                  disabled={exportingId !== null}
                  className="flex items-center space-x-1.5 px-2.5 py-1.5 border border-gray-200 dark:border-graphite-850 hover:bg-gray-50 dark:hover:bg-graphite-850 rounded-lg font-bold text-gray-600 dark:text-gray-400 disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{exportingId === rep.id ? 'Exporting...' : 'Export'}</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* AI SHIFT EXECUTIVE BRIEFING */}
        <div className="bg-forest-950 text-white rounded-xl p-5 border border-forest-800 shadow-premium relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-forest-900/30 rounded-full filter blur-xl"></div>
          
          <div className="relative z-10 space-y-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4.5 h-4.5 text-emerald-500 animate-pulse" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-forest-200">AI Shift Executive Summary</h3>
            </div>
            
            <div className="space-y-4 text-xs font-medium text-forest-100 leading-relaxed">
              <div className="p-3.5 bg-forest-900/40 rounded-lg border border-forest-800 space-y-2">
                <p className="font-bold text-white text-xs">Shift Summary (July 14)</p>
                <p className="text-[11px] leading-relaxed text-forest-100">
                  Spectator arrivals peaked at 78,912 fans. Total occupancy reached 98.6% by kick-off.
                </p>
                <p className="text-[11px] leading-relaxed text-forest-100">
                  Incident dispatches resolved medical report Sections 102. Gate scanner backing logs required rerouting crowd streams to Gate C.
                </p>
                <p className="text-[11px] leading-relaxed text-forest-100 font-bold text-white">
                  Solar buffers offset energy grid demands by 34.5% during Peak HVAC operations.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
export default Reports;
