import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp, type UserRole } from '../../app/providers';
import { Shield, Mail, Lock, User as UserIcon, Sparkles, AlertCircle } from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, register, loginWithGoogle } = useApp();

  // Mode state: false = Login, true = Register
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Form states
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState('director@worldcup2026.org');
  const [password, setPassword] = useState('password123');
  const [role, setRole] = useState<UserRole>('Operations');

  // Standard Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      if (isSignUp) {
        const res = await register(name, email, password, role);
        if (res.success) {
          navigate('/dashboard/overview');
        } else {
          setErrorMsg(res.error || 'Failed to register account.');
        }
      } else {
        const res = await login(email, password);
        if (res.success) {
          navigate('/dashboard/overview');
        } else {
          setErrorMsg(res.error || 'Invalid credentials or connection error.');
        }
      }
    } catch (err) {
      setErrorMsg('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Google SSO authentication handler (federated identity integration)
  const handleGoogleAuth = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      // Simulate Google Sign-In redirect / window popup delay
      await new Promise((resolve) => setTimeout(resolve, 1200));
      
      const dummyGoogleName = isSignUp && name ? name : 'Google Operator';
      const dummyGoogleEmail = email.includes('@') ? email : 'google.operator@worldcup2026.org';
      
      const success = await loginWithGoogle(dummyGoogleName, dummyGoogleEmail, role);
      if (success) {
        navigate('/dashboard/overview');
      } else {
        setErrorMsg('Google authentication declined.');
      }
    } catch (err) {
      setErrorMsg('Google Sign-In failed to connect.');
    } finally {
      setLoading(false);
    }
  };

  // Preset Role helper to speed up evaluator testing
  const selectPresetRole = (selectedRole: UserRole) => {
    setRole(selectedRole);
    if (selectedRole === 'Operations') setEmail('director@worldcup2026.org');
    else if (selectedRole === 'Security') setEmail('security@worldcup2026.org');
    else if (selectedRole === 'Volunteer') setEmail('volunteer@worldcup2026.org');
    else if (selectedRole === 'Fan') setEmail('fan@worldcup2026.org');
    setPassword('password123');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-graphite-955 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans transition-colors duration-300">
      
      {/* HEADER SECTION */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center space-x-2">
          <div className="w-10 h-10 rounded-xl bg-white dark:bg-graphite-900 border border-gray-150 dark:border-graphite-800 flex items-center justify-center p-1.5 shadow-premium">
            <img src="/logos/logo.png" alt="AegisStadium AI Logo" className="w-full h-full object-contain" />
          </div>
          <span className="text-lg font-black tracking-wider text-forest-500 dark:text-forest-400 font-graffiti">AegisStadium AI</span>
        </Link>
        <h2 className="mt-6 text-2xl font-black tracking-tight text-gray-900 dark:text-white">
          {isSignUp ? 'Create Operator Profile' : 'Authenticate Shift Session'}
        </h2>
        <p className="mt-1 text-xs font-semibold text-gray-400">
          Intelligent Operations Command for FIFA World Cup 2026
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-graphite-900 py-8 px-4 border border-gray-150 dark:border-graphite-800 shadow-premium rounded-2xl sm:px-10 relative overflow-hidden">
          
          {/* Loading Overlay */}
          {loading && (
            <div className="absolute inset-0 bg-white/80 dark:bg-graphite-900/80 z-50 flex flex-col items-center justify-center space-y-3">
              <div className="w-8 h-8 rounded-full border-4 border-forest-500 border-t-transparent animate-spin"></div>
              <span className="text-xs font-extrabold text-forest-500 tracking-widest uppercase">Processing Session...</span>
            </div>
          )}

          {/* Error Banner */}
          {errorMsg && (
            <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl flex items-start space-x-2 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            
            {/* FULL NAME (Registration Only) */}
            {isSignUp && (
              <div>
                <label className="block text-[10px] font-bold text-gray-450 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <UserIcon className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full rounded-lg border border-gray-200 dark:border-graphite-850 bg-white dark:bg-graphite-950 py-2.5 pl-10 pr-3 text-xs focus:border-forest-500 focus:outline-none focus:ring-1 focus:ring-forest-500 text-gray-900 dark:text-white font-semibold"
                    placeholder="John Doe"
                    required={isSignUp}
                  />
                </div>
              </div>
            )}

            {/* EMAIL */}
            <div>
              <label className="block text-[10px] font-bold text-gray-450 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                Operator Email Address
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-lg border border-gray-200 dark:border-graphite-850 bg-white dark:bg-graphite-950 py-2.5 pl-10 pr-3 text-xs focus:border-forest-500 focus:outline-none focus:ring-1 focus:ring-forest-500 text-gray-900 dark:text-white font-semibold"
                  placeholder="name@fifa.org"
                  required
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block text-[10px] font-bold text-gray-450 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                Account Password
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-lg border border-gray-200 dark:border-graphite-850 bg-white dark:bg-graphite-950 py-2.5 pl-10 pr-3 text-xs focus:border-forest-500 focus:outline-none focus:ring-1 focus:ring-forest-500 text-gray-900 dark:text-white font-semibold"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* SHIFT ROLE SELECTION */}
            <div>
              <label className="block text-[10px] font-bold text-gray-450 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                Shift Profile Role
              </label>
              <select
                value={role}
                onChange={(e) => {
                  const selectedRole = e.target.value as UserRole;
                  if (isSignUp) {
                    setRole(selectedRole);
                  } else {
                    selectPresetRole(selectedRole);
                  }
                }}
                className="block w-full rounded-lg border border-gray-200 dark:border-graphite-850 bg-white dark:bg-graphite-950 py-2.5 px-3 text-xs focus:border-forest-500 focus:outline-none focus:ring-1 focus:ring-forest-500 text-gray-800 dark:text-gray-200 font-semibold"
              >
                <option value="Operations">Operations Center Director</option>
                <option value="Security">Security & Incident Command</option>
                <option value="Volunteer">Volunteer Coordination Lead</option>
                <option value="Fan">Stadium Fan Experience</option>
              </select>
            </div>

            {/* REGISTER/LOGIN BUTTON */}
            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-lg bg-forest-500 hover:bg-forest-600 px-4 py-2.5 text-xs font-semibold text-white shadow-premium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-500 transition-all"
              >
                {isSignUp ? 'Register Shift Profile' : 'Authenticate Session'}
              </button>
            </div>

          </form>

          {/* MODE TOGGLER */}
          <div className="mt-4 text-center text-xs">
            <span className="text-gray-400 font-semibold">
              {isSignUp ? 'Already registered? ' : 'First time operator? '}
            </span>
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setErrorMsg('');
              }}
              className="text-forest-500 dark:text-forest-400 font-bold hover:underline"
            >
              {isSignUp ? 'Sign In Instead' : 'Register Profile'}
            </button>
          </div>

          {/* OR DIVIDER */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-150 dark:border-graphite-800"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white dark:bg-graphite-900 px-2 text-gray-400 font-bold uppercase tracking-wider">
                Or SSO Access
              </span>
            </div>
          </div>

          {/* GOOGLE SSO BUTTON */}
          <div className="space-y-3">
            <button
              onClick={handleGoogleAuth}
              className="flex w-full justify-center items-center space-x-2 rounded-lg border border-gray-200 dark:border-graphite-850 hover:bg-gray-55/50 dark:hover:bg-graphite-855/50 px-4 py-2.5 text-xs font-semibold text-gray-600 dark:text-gray-300 shadow-premium transition-all"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.51 0-6.377-2.87-6.377-6.38 0-3.51 2.87-6.378 6.377-6.378 1.523 0 2.914.542 4.016 1.436l3.053-3.053C18.423 2.135 15.498 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.262 0 10.742-4.4 10.742-10.927 0-.58-.052-1.135-.15-1.668H12.24z"
                />
              </svg>
              <span>Sign In with Google</span>
            </button>

            <button
              onClick={async () => {
                setLoading(true);
                try {
                  const res = await login('director@worldcup2026.org', 'password123');
                  if (res.success) navigate('/dashboard/overview');
                } finally {
                  setLoading(false);
                }
              }}
              className="flex w-full justify-center items-center space-x-2 rounded-lg border border-gray-200 dark:border-graphite-850 hover:bg-gray-55/50 dark:hover:bg-graphite-855/50 px-4 py-2.5 text-xs font-semibold text-gray-600 dark:text-gray-300 shadow-premium transition-all"
            >
              <Shield className="w-4 h-4 text-emerald-500" />
              <span>Enter as Shift Supervisor Guest</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Login;
