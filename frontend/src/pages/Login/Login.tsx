import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../app/providers';
import { Shield, Key, Mail, Lock } from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { role, setRole } = useApp();
  const [email, setEmail] = useState('director@worldcup2026.org');
  const [password, setPassword] = useState('••••••••••••');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Proceed directly to the dashboard overview.
    navigate('/dashboard/overview');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-graphite-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center space-x-2">
          <img src="/logos/logo.png" alt="VenueOS AI Logo" className="w-10 h-10 rounded-xl object-contain border border-gray-150 dark:border-graphite-800" />
          <span className="text-lg font-bold text-forest-500 dark:text-forest-400">VenueOS AI</span>
        </Link>
        <h2 className="mt-6 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Operations Console Sign-in
        </h2>
        <p className="mt-1.5 text-xs font-semibold text-gray-400">
          World Cup 2026 Smart Stadiums Core Security
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-graphite-900 py-8 px-4 border border-gray-150 dark:border-graphite-800 shadow-premium rounded-2xl sm:px-10">
          <form className="space-y-5" onSubmit={handleLogin}>
            
            {/* EMAIL */}
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Operator Email
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-4 h-4 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-lg border border-gray-200 dark:border-graphite-800 bg-white dark:bg-graphite-950 py-2.5 pl-10 pr-3 text-xs focus:border-forest-500 focus:outline-none focus:ring-1 focus:ring-forest-500 text-gray-900 dark:text-white"
                  placeholder="name@fifa.org"
                  required
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div>
              <label htmlFor="password" className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Operational Token Key
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-4 h-4 text-gray-400" />
                </div>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-lg border border-gray-200 dark:border-graphite-800 bg-white dark:bg-graphite-950 py-2.5 pl-10 pr-3 text-xs focus:border-forest-500 focus:outline-none focus:ring-1 focus:ring-forest-500 text-gray-900 dark:text-white"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* SELECT DEFAULT INITIAL SHIFT ROLE */}
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Initial Shift Profile
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="block w-full rounded-lg border border-gray-200 dark:border-graphite-800 bg-white dark:bg-graphite-950 py-2.5 px-3 text-xs focus:border-forest-500 focus:outline-none focus:ring-1 focus:ring-forest-500 text-gray-800 dark:text-gray-300"
              >
                <option value="Operations">Operations Center Director</option>
                <option value="Security">Security & First Responder Command</option>
                <option value="Volunteer">Volunteer Coordination Lead</option>
                <option value="Fan">Stadium Fan Experience Monitor</option>
              </select>
            </div>

            {/* ACTION BUTTON */}
            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-lg bg-forest-500 hover:bg-forest-600 px-4 py-2.5 text-xs font-semibold text-white shadow-premium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-500 transition-all"
              >
                Authenticate Shift
              </button>
            </div>

          </form>
          
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-150 dark:border-graphite-800"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white dark:bg-graphite-900 px-2 text-gray-400 font-bold uppercase tracking-wider">
                Or Bypass
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              setRole('Operations');
              navigate('/dashboard/overview');
            }}
            className="flex w-full justify-center items-center space-x-2 rounded-lg border border-gray-200 dark:border-graphite-850 hover:bg-gray-50 dark:hover:bg-graphite-850 px-4 py-2.5 text-xs font-semibold text-gray-600 dark:text-gray-300 shadow-premium transition-all"
          >
            <Shield className="w-4 h-4 text-emerald-500" />
            <span>Enter as Shift Supervisor Guest</span>
          </button>
        </div>
      </div>
    </div>
  );
};
export default Login;
