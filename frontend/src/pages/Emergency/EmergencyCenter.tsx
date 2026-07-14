import React, { useState } from 'react';
import { useApp } from '../../app/providers';
import {
  AlertOctagon,
  Volume2,
  PhoneCall,
  Navigation,
  Activity,
  Flame,
  PlusCircle,
  Megaphone,
  ShieldCheck
} from 'lucide-react';

export const EmergencyCenter: React.FC = () => {
  const { incidents } = useApp();
  const [paScript, setPaScript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);

  const activeIncidents = incidents.filter(i => i.status !== 'RESOLVED');
  const criticalCount = activeIncidents.filter(i => i.severity === 'CRITICAL' || i.severity === 'HIGH').length;

  // Calculate stadium risk score
  const baseRisk = activeIncidents.length * 15;
  const criticalMultiplier = criticalCount * 25;
  const riskScore = Math.min(baseRisk + criticalMultiplier, 100);

  const handleGeneratePA = (type: 'evac' | 'congestion' | 'medical') => {
    if (type === 'evac') {
      setPaScript(
        "ATTENTION LUSAIL STADIUM SPECTATORS. PLEASE REMAIN CALM. DUE TO AN OPERATIONAL ALARM, SECTORS EAST AND NORTH ARE DIRECTED TO EVACUATE SLOWLY. PLEASE PROCEED TOWARDS THE NEAREST SIGNS LEADING TO GATE C EXIT PORTALS. VOLUNTEERS ARE DEPLOYED TO ASSIST YOU. REPEATING, DO NOT USE ELEVATORS OR RUN IN THE CONCOURSE AREAS."
      );
    } else if (type === 'congestion') {
      setPaScript(
        "ATTENTION FANS AT GATE A. WE ARE EXPERIENCING DELAYS NEAR THE NORTH ENTRANCE SCANNER GRID. SECURITY DIRECTS ALL SPECTATORS HOLDING TICKETS FOR GATES A-1 THROUGH A-5 TO REROUTE TO THE SOUTH GATE C ENTRANCE PORTAL. WALKWAY LEADERS ARE STANDING BY TO DIRECT YOU."
      );
    } else {
      setPaScript(
        "OPERATIONAL MESSAGE TO VOLUNTEER STAFF IN SECTOR 102. MEDICAL TEAMS ARE DISPATCHED AND ON SCENE. PLEASE CLEAR THE CENTRAL WALKWAY AND MAINTAIN SECTOR BARRIERS TO ENSURE RAPID PASSAGE FOR RESPONDERS. THANK YOU FOR YOUR IMMEDIATE ASSISTANCE."
      );
    }
  };

  const speakPA = () => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
      }
      const utterance = new SpeechSynthesisUtterance(paScript);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Speech API not supported.');
    }
  };

  const emergencyContacts = [
    { title: 'Security Command Desk', phone: '+974 4490 0011', status: 'ONLINE' },
    { title: 'Emergency Medical Services (EMS)', phone: '+974 4490 0022', status: 'STANDBY' },
    { title: 'Lusail Fire & Civil Defense', phone: '+974 4490 0033', status: 'STANDBY' },
    { title: 'FIFA Tournament Ops Coordinator', phone: '+974 4490 0044', status: 'ONLINE' }
  ];

  return (
    <div className="space-y-6 font-sans">
      
      {/* EMERGENCY SUBHEADER */}
      <div className="flex justify-between items-center premium-card p-4.5">
        <div>
          <h2 className="text-base font-bold text-gray-800 dark:text-white">Emergency Coordination & Megaphone Broadcasts</h2>
          <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold">Global venue alert thresholds, evacuation mapping, and public warning script generators</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* RISK GAUGES AND CRITICAL INCIDENTS */}
        <div className="space-y-6 lg:col-span-2">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* RISK LEVEL STATUS */}
            <div className="premium-card p-4.5 flex flex-col justify-between min-h-[135px]">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Stadium Risk Index</span>
                <span className={`text-2xl font-extrabold mt-1.5 block ${
                  riskScore > 60 ? 'text-red-500 animate-pulse' : riskScore > 30 ? 'text-amber-500' : 'text-emerald-600'
                }`}>
                  {riskScore}/100
                </span>
              </div>
              <span className="text-[10px] text-gray-400 font-bold block">
                {riskScore > 60 ? 'Critical action needed' : riskScore > 30 ? 'Moderate active alerts' : 'Normal Operations'}
              </span>
            </div>

            {/* SEVERE INCIDENTS */}
            <div className="premium-card p-4.5 flex flex-col justify-between min-h-[135px]">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Severe Incidents</span>
                <span className="text-2xl font-extrabold mt-1.5 text-gray-800 dark:text-white block">{criticalCount}</span>
              </div>
              <span className="text-[10px] text-gray-400 font-bold block">Severity High or Critical</span>
            </div>

            {/* VOLUNTEER ALERTS */}
            <div className="premium-card p-4.5 flex flex-col justify-between min-h-[135px]">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Responders Dispatched</span>
                <span className="text-2xl font-extrabold mt-1.5 text-gray-800 dark:text-white block">
                  {activeIncidents.filter(i=>i.assignedTeam!=='Unassigned Patrol').length}
                </span>
              </div>
              <span className="text-[10px] text-gray-400 font-bold block">Assigned active crews</span>
            </div>

          </div>

          {/* PA SCRIPT MEGA BROADCAS CONTROL */}
          <div className="premium-card p-4.5 space-y-4">
            <div className="flex items-center space-x-2">
              <Megaphone className="w-4.5 h-4.5 text-forest-500" />
              <h3 className="text-xs font-bold text-gray-700 dark:text-white uppercase tracking-wider">Megaphone Alert PA Script Generator</h3>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleGeneratePA('evac')}
                className="px-3 py-1.5 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-md text-[10px] font-bold transition-all"
              >
                Evacuation Directive
              </button>
              <button
                onClick={() => handleGeneratePA('congestion')}
                className="px-3 py-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-500 hover:bg-amber-500/20 rounded-md text-[10px] font-bold transition-all"
              >
                Gate Congestion Redirect
              </button>
              <button
                onClick={() => handleGeneratePA('medical')}
                className="px-3 py-1.5 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 rounded-md text-[10px] font-bold transition-all"
              >
                Responder Pathway Alert
              </button>
            </div>

            <div className="space-y-3">
              <textarea
                value={paScript}
                onChange={(e) => setPaScript(e.target.value)}
                className="w-full h-28 bg-gray-55 dark:bg-graphite-955 border border-gray-250 dark:border-graphite-850 p-3 rounded-lg text-xs leading-relaxed text-gray-800 dark:text-gray-300 font-bold uppercase focus:outline-none focus:ring-1 focus:ring-red-500"
                placeholder="Select a template above or draft custom PA announcements here..."
              ></textarea>

              {paScript.length > 0 && (
                <div className="flex justify-end">
                  <button
                    onClick={speakPA}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-forest-500 hover:bg-forest-600 text-white rounded-lg text-xs font-semibold shadow-premium transition-all"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>{isSpeaking ? 'Stop Vocalizer' : 'Vocalize announcement'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* EMERGENCY LOGS & HOTLINES */}
        <div className="space-y-6">
          
          {/* HOTLINES LIST */}
          <div className="premium-card p-4.5 space-y-4">
            <div className="flex items-center space-x-2">
              <PhoneCall className="w-4.5 h-4.5 text-red-500" />
              <h3 className="text-xs font-bold text-gray-700 dark:text-white uppercase tracking-wider">Core Dispatch Lines</h3>
            </div>
            <div className="space-y-3">
              {emergencyContacts.map((ct, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs p-2.5 bg-gray-50/50 dark:bg-graphite-850/50 rounded-xl border border-gray-150/20 dark:border-graphite-800/20">
                  <div>
                    <span className="font-bold text-gray-800 dark:text-gray-200 block">{ct.title}</span>
                    <span className="text-[10px] text-gray-400 font-semibold">{ct.phone}</span>
                  </div>
                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold ${
                    ct.status === 'ONLINE' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-blue-500/10 text-blue-500'
                  }`}>
                    {ct.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* EVACUATION SECTOR DIRECTIONS */}
          <div className="premium-card p-4.5 space-y-4">
            <div className="flex items-center space-x-2">
              <Navigation className="w-4.5 h-4.5 text-forest-500" />
              <h3 className="text-xs font-bold text-gray-700 dark:text-white uppercase tracking-wider">Evacuation Directives</h3>
            </div>
            <div className="space-y-3 text-xs text-gray-500 dark:text-gray-400 font-medium">
              <div className="flex justify-between items-center py-2 border-b border-gray-150/40 dark:border-graphite-855/45">
                <span>Sector North (A)</span>
                <span className="font-bold text-gray-850 dark:text-gray-200">Exit Gate A &rarr; Assembly Field A</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-150/40 dark:border-graphite-855/45">
                <span>Sector East (B)</span>
                <span className="font-bold text-gray-850 dark:text-gray-200">Exit Gate B &rarr; Lot Alpha VIP</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-150/40 dark:border-graphite-855/45">
                <span>Sector South (C)</span>
                <span className="font-bold text-gray-850 dark:text-gray-200">Exit Gate C &rarr; Rideshare Hub</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span>Sector West (D)</span>
                <span className="font-bold text-gray-850 dark:text-gray-200">Exit Gate D &rarr; Parking Beta</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
export default EmergencyCenter;
