import React from 'react';
import { useRouteError, Link } from 'react-router-dom';
import { ShieldAlert, RefreshCw, Home, Terminal } from 'lucide-react';

export const ErrorBoundaryPage: React.FC = () => {
  const error = useRouteError() as any;
  console.error('System Boundary Captured Exception:', error);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-graphite-950 flex flex-col justify-center items-center px-4 font-sans text-center">
      <div className="w-14 h-14 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mb-6 animate-pulse">
        <ShieldAlert className="w-7 h-7" />
      </div>

      <div className="space-y-2 max-w-md">
        <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
          Operations Console Terminal Exception
        </h1>
        <p className="text-xs text-gray-400 font-semibold leading-relaxed">
          A rendering fault occurred. Telemetry streams are safely sandboxed.
        </p>
      </div>

      {/* ERROR MESSAGE DETAILS GRID */}
      <div className="my-6 p-4 bg-white dark:bg-graphite-900 border border-gray-150 dark:border-graphite-850 rounded-xl max-w-lg text-left shadow-premium space-y-2.5">
        <div className="flex items-center space-x-2 text-[10px] uppercase font-bold text-gray-400">
          <Terminal className="w-3.5 h-3.5 text-red-500" />
          <span>Diagnostic Log</span>
        </div>
        <p className="text-[11px] font-mono text-red-500 bg-red-50/20 dark:bg-red-950/10 p-2.5 rounded border border-red-100 dark:border-red-900/30 overflow-x-auto whitespace-pre-wrap">
          {error?.message || error?.statusText || 'Unknown Exception'}
        </p>
      </div>

      {/* ACTION TRIGGERS */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => window.location.reload()}
          className="flex items-center space-x-2 px-4 py-2 bg-forest-500 hover:bg-forest-600 text-white rounded-lg text-xs font-semibold shadow-premium transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Hot Reload Terminal</span>
        </button>
        <Link
          to="/dashboard/overview"
          className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-graphite-900 border border-gray-250 dark:border-graphite-800 hover:bg-gray-55 dark:hover:bg-graphite-850 text-gray-600 dark:text-gray-300 rounded-lg text-xs font-semibold shadow-premium transition-all"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Console Home</span>
        </Link>
      </div>
    </div>
  );
};
export default ErrorBoundaryPage;
