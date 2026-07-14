import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-graphite-950 flex flex-col justify-center items-center px-4 font-sans text-center">
      <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-6">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
        Operational Route Unmapped
      </h1>
      <p className="mt-2 text-xs text-gray-400 font-semibold max-w-sm">
        The requested screen resource does not exist on this console terminal node.
      </p>
      <Link
        to="/dashboard/overview"
        className="mt-6 px-4 py-2 bg-forest-500 hover:bg-forest-600 text-white rounded-lg text-xs font-semibold shadow-premium transition-all"
      >
        Return to Overview Control Room
      </Link>
    </div>
  );
};
export default NotFound;
