import React, { useState } from 'react';
import { useApp } from '../../app/providers';
import {
  Accessibility,
  HeartHandshake,
  Volume2,
  Navigation,
  CheckCircle,
  HelpCircle,
  Eye,
  Languages
} from 'lucide-react';

export const AccessibilityCenter: React.FC = () => {
  const { language, setLanguage, t } = useApp();
  const [assistanceStatus, setAssistanceStatus] = useState<'IDLE' | 'REQUESTING' | 'SENT'>('IDLE');
  const [requestSector, setRequestSector] = useState('');
  const [assistanceType, setAssistanceType] = useState('Wheelchair Escort');

  const accessibleFacilities = [
    { name: 'Elevator Bank E1 (West)', type: 'Lift Access', status: 'OPERATIONAL' },
    { name: 'Elevator Bank E2 (West)', type: 'Lift Access', status: 'OPERATIONAL' },
    { name: 'Gate D Audio Induction Loop', type: 'Hearing Aid Loop', status: 'OPERATIONAL' },
    { name: 'Concourse Level 1 ramp A', type: 'Wheelchair Ramp', status: 'OPERATIONAL' },
    { name: 'Concourse Level 1 ramp B', type: 'Wheelchair Ramp', status: 'MAINTENANCE' }
  ];

  const handleRequestAssistance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestSector) return;
    setAssistanceStatus('REQUESTING');
    setTimeout(() => {
      setAssistanceStatus('SENT');
    }, 1500);
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* ACCESSIBILITY SUBHEADER */}
      <div className="flex justify-between items-center premium-card p-5">
        <div>
          <h2 className="text-base font-bold text-gray-800 dark:text-white">Spectator Accessibility & Support Center</h2>
          <p className="text-xs text-gray-400 dark:text-gray-550 font-semibold">Elevator telemetry status, translation assists, and wheelchair escort dispatches</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* FACILITIES MONITORING */}
        <div className="lg:col-span-2 premium-card p-5 space-y-4">
          <div className="flex items-center space-x-2">
            <Accessibility className="w-5 h-5 text-forest-500" />
            <h3 className="text-xs font-bold text-gray-700 dark:text-white uppercase tracking-wider">{t('facilityStatus')}</h3>
          </div>
          
          <div className="space-y-3">
            {accessibleFacilities.map((f, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs p-3.5 bg-gray-50/50 dark:bg-graphite-850/50 rounded-xl border border-gray-150/30 dark:border-graphite-800/30">
                <div>
                  <span className="font-bold text-gray-750 dark:text-gray-300 block">{f.name}</span>
                  <span className="text-[10px] text-gray-400 font-semibold">{f.type}</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                  f.status === 'OPERATIONAL'
                    ? 'bg-emerald-500/10 text-emerald-600'
                    : 'bg-amber-500/10 text-amber-500'
                }`}>
                  {f.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* SPECIAL DISPATCH FORM */}
        <div className="space-y-6">
          
          {/* DISPATCH ESCORT MODAL */}
          <div className="premium-card p-5 space-y-4">
            <div className="flex items-center space-x-2">
              <HeartHandshake className="w-5 h-5 text-forest-500" />
              <h3 className="text-xs font-bold text-gray-700 dark:text-white uppercase tracking-wider">{t('escortRequest')}</h3>
            </div>

            {assistanceStatus === 'SENT' ? (
              <div className="p-4 bg-emerald-500/10 text-emerald-600 rounded-lg text-center space-y-2">
                <CheckCircle className="w-7 h-7 text-emerald-500 mx-auto" />
                <span className="text-xs font-bold block">Assistance Request Logged</span>
                <span className="text-[10px] text-gray-500 block font-semibold">
                  A volunteer escort was dispatched to Sector **{requestSector}**.
                </span>
                <button
                  onClick={() => setAssistanceStatus('IDLE')}
                  className="mt-1.5 text-xs text-forest-500 font-bold hover:underline"
                >
                  Request another escort
                </button>
              </div>
            ) : (
              <form onSubmit={handleRequestAssistance} className="space-y-3 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{t('escortProfile')}</label>
                  <select
                    value={assistanceType}
                    onChange={(e) => setAssistanceType(e.target.value)}
                    className="w-full bg-white dark:bg-graphite-955 border border-gray-250 dark:border-graphite-850 p-2 rounded-lg text-xs text-gray-800 dark:text-gray-200"
                  >
                    <option value="Wheelchair Escort">Wheelchair Escort Dispatch</option>
                    <option value="Vision Guide">Vision Assistant Guide</option>
                    <option value="Audio Induction Headset">Hearing Aid Set delivery</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{t('seatingSection')}</label>
                  <input
                    type="text"
                    placeholder="e.g. Block 102 Row G Seat 12"
                    value={requestSector}
                    onChange={(e) => setRequestSector(e.target.value)}
                    className="w-full bg-white dark:bg-graphite-955 border border-gray-250 dark:border-graphite-850 p-2 rounded-lg text-xs text-gray-905 dark:text-white"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={assistanceStatus === 'REQUESTING'}
                  className="w-full py-2 bg-forest-500 hover:bg-forest-600 disabled:bg-gray-350 text-white font-bold rounded-lg shadow-premium text-xs transition-all"
                >
                  {assistanceStatus === 'REQUESTING' ? 'Dispatching Staff...' : t('dispatchButton')}
                </button>
              </form>
            )}
          </div>

          {/* MULTILINGUAL VOICES MOCKS */}
          <div className="premium-card p-5 space-y-4">
            <div className="flex items-center space-x-2">
              <Languages className="w-5 h-5 text-forest-500" />
              <h3 className="text-xs font-bold text-gray-700 dark:text-white uppercase tracking-wider">{t('languageAssistance')}</h3>
            </div>
            
            <p className="text-[10px] text-gray-400 dark:text-gray-550 font-semibold leading-relaxed">
              Activate automated translation helpers to translate stadium PA alerts for multilingual tournament spectators.
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs font-bold">
              <button 
                onClick={() => setLanguage('en')}
                className={`py-2.5 px-3 border rounded-xl flex items-center justify-between transition-all ${
                  language === 'en'
                    ? 'border-forest-500 bg-forest-500/5 text-forest-500 dark:text-forest-400'
                    : 'border-gray-250 dark:border-graphite-850 text-gray-650 dark:text-gray-400 hover:bg-gray-55 dark:hover:bg-graphite-855'
                }`}
              >
                <span>English</span>
                {language === 'en' && <span className="text-[10px] text-emerald-600 font-extrabold">{t('activeLabel')}</span>}
              </button>
              <button 
                onClick={() => setLanguage('es')}
                className={`py-2.5 px-3 border rounded-xl flex items-center justify-between transition-all ${
                  language === 'es'
                    ? 'border-forest-500 bg-forest-500/5 text-forest-500 dark:text-forest-400'
                    : 'border-gray-250 dark:border-graphite-850 text-gray-650 dark:text-gray-400 hover:bg-gray-55 dark:hover:bg-graphite-855'
                }`}
              >
                <span>Español</span>
                {language === 'es' && <span className="text-[10px] text-emerald-600 font-extrabold">{t('activeLabel')}</span>}
              </button>
              <button 
                onClick={() => setLanguage('ar')}
                className={`py-2.5 px-3 border rounded-xl flex items-center justify-between transition-all ${
                  language === 'ar'
                    ? 'border-forest-500 bg-forest-500/5 text-forest-500 dark:text-forest-400'
                    : 'border-gray-250 dark:border-graphite-850 text-gray-650 dark:text-gray-400 hover:bg-gray-55 dark:hover:bg-graphite-855'
                }`}
              >
                <span className="leading-none">العربية</span>
                {language === 'ar' && <span className="text-[10px] text-emerald-600 font-extrabold">{t('activeLabel')}</span>}
              </button>
              <button 
                onClick={() => setLanguage('fr')}
                className={`py-2.5 px-3 border rounded-xl flex items-center justify-between transition-all ${
                  language === 'fr'
                    ? 'border-forest-500 bg-forest-500/5 text-forest-500 dark:text-forest-400'
                    : 'border-gray-250 dark:border-graphite-850 text-gray-650 dark:text-gray-400 hover:bg-gray-55 dark:hover:bg-graphite-855'
                }`}
              >
                <span>Français</span>
                {language === 'fr' && <span className="text-[10px] text-emerald-600 font-extrabold">{t('activeLabel')}</span>}
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
export default AccessibilityCenter;
