import React, { useState } from 'react';
import { useApp } from '../../app/providers';
import { FileText, Download, Sparkles, BarChart2, Users, Shield, Zap } from 'lucide-react';

// ──────────────────────────────────────────────────────────────────────────
// Styled HTML report generator
// ──────────────────────────────────────────────────────────────────────────
const buildHtmlReport = (
  title: string,
  category: string,
  date: string,
  sections: { heading: string; rows: { label: string; value: string; highlight?: boolean }[] }[]
): string => {
  const categoryColors: Record<string, { bg: string; accent: string; badge: string }> = {
    Crowds:       { bg: '#0f172a', accent: '#10b981', badge: '#064e3b' },
    Sustainability:{ bg: '#0f172a', accent: '#f59e0b', badge: '#78350f' },
    Security:     { bg: '#0f172a', accent: '#ef4444', badge: '#7f1d1d' },
    Transport:    { bg: '#0f172a', accent: '#3b82f6', badge: '#1e3a8a' },
  };
  const col = categoryColors[category] || categoryColors['Crowds'];

  const sectionsHtml = sections.map(sec => `
    <div class="section">
      <div class="section-heading">${sec.heading}</div>
      <table>
        <tbody>
          ${sec.rows.map(r => `
            <tr class="${r.highlight ? 'highlight' : ''}">
              <td class="label">${r.label}</td>
              <td class="value">${r.value}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>${title}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Inter', sans-serif;
    background: #f8fafc;
    color: #1e293b;
    padding: 40px;
    min-height: 100vh;
  }
  /* HEADER */
  .header {
    background: ${col.bg};
    color: #fff;
    border-radius: 16px;
    padding: 36px 40px;
    margin-bottom: 32px;
    position: relative;
    overflow: hidden;
  }
  .header::before {
    content: '';
    position: absolute;
    top: -60px; right: -60px;
    width: 220px; height: 220px;
    border-radius: 50%;
    background: ${col.accent}22;
  }
  .header-brand {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
  }
  .header-brand-dot {
    width: 10px; height: 10px;
    border-radius: 50%;
    background: ${col.accent};
    animation: pulse 2s infinite;
  }
  @keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:0.5;} }
  .header-brand-text {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    color: ${col.accent};
  }
  .header h1 {
    font-size: 26px;
    font-weight: 800;
    letter-spacing: -0.5px;
    line-height: 1.2;
    margin-bottom: 12px;
    position: relative;
  }
  .header-meta {
    display: flex;
    gap: 24px;
    font-size: 11px;
    color: #94a3b8;
    font-weight: 600;
  }
  .badge {
    display: inline-block;
    padding: 4px 10px;
    border-radius: 6px;
    background: ${col.badge};
    color: ${col.accent};
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }
  /* SECTIONS */
  .section {
    background: #fff;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    margin-bottom: 20px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  }
  .section-heading {
    background: linear-gradient(to right, ${col.bg}, #1e293b);
    color: ${col.accent};
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    padding: 12px 20px;
    border-left: 4px solid ${col.accent};
  }
  table {
    width: 100%;
    border-collapse: collapse;
  }
  tr { border-bottom: 1px solid #f1f5f9; }
  tr:last-child { border-bottom: none; }
  td { padding: 12px 20px; font-size: 12px; vertical-align: middle; }
  td.label {
    color: #64748b;
    font-weight: 600;
    width: 45%;
  }
  td.value {
    color: #1e293b;
    font-weight: 700;
  }
  tr.highlight { background: ${col.accent}0f; }
  tr.highlight td.label { color: ${col.accent}bb; }
  tr.highlight td.value { color: ${col.accent}; }
  /* FOOTER */
  .footer {
    margin-top: 32px;
    padding: 20px 28px;
    background: ${col.bg};
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: #64748b;
    font-size: 10px;
    font-weight: 600;
  }
  .footer-brand { color: ${col.accent}; font-weight: 700; }
</style>
</head>
<body>
  <div class="header">
    <div class="header-brand">
      <div class="header-brand-dot"></div>
      <span class="header-brand-text">AegisStadium AI · FIFA World Cup 2026 · Stadium Intelligence Platform</span>
    </div>
    <h1>${title}</h1>
    <div class="header-meta">
      <span>Report Date: ${date}</span>
      <span>Generated: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</span>
      <span class="badge">${category}</span>
    </div>
  </div>

  ${sectionsHtml}

  <div class="footer">
    <span>This report was automatically generated by the <span class="footer-brand">AegisStadium AI Platform</span>. For internal use only.</span>
    <span>${date}</span>
  </div>
</body>
</html>`;
};

// ──────────────────────────────────────────────────────────────────────────
// Trigger a browser file download
// ──────────────────────────────────────────────────────────────────────────
const triggerDownload = (html: string, filename: string) => {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// ──────────────────────────────────────────────────────────────────────────
// Reports Component
// ──────────────────────────────────────────────────────────────────────────
export const Reports: React.FC = () => {
  const { crowd, sustainability, incidents, matches } = useApp();
  const [exportingId, setExportingId] = useState<string | null>(null);

  const today = new Date().toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const reportItems = [
    {
      id: 'rep-001',
      name: 'Crowd Ingress & Gate Inflow Audit',
      date: today,
      size: '2.4 MB',
      category: 'Crowds',
      icon: Users,
      iconColor: 'text-emerald-500',
      generate: () => {
        const totalOcc = crowd.totalOccupancy.toLocaleString();
        const cap = crowd.maxCapacity.toLocaleString();
        const pct = crowd.occupancyPercentage.toFixed(1);
        const flow = crowd.crowdFlowRatePpm;
        return buildHtmlReport(
          'Crowd Ingress & Gate Inflow Audit',
          'Crowds',
          today,
          [
            {
              heading: 'Stadium Occupancy Overview',
              rows: [
                { label: 'Total Fans Present', value: totalOcc, highlight: true },
                { label: 'Maximum Venue Capacity', value: cap },
                { label: 'Occupancy Percentage', value: `${pct}%`, highlight: true },
                { label: 'Crowd Flow Rate', value: `${flow} ppm` },
              ]
            },
            {
              heading: 'Sector-by-Sector Breakdown',
              rows: crowd.sectors.length > 0
                ? crowd.sectors.map(s => ({
                    label: s.name,
                    value: `${s.occupancy.toLocaleString()} / ${s.capacity.toLocaleString()} (${Math.round((s.occupancy / s.capacity) * 100)}%)`,
                    highlight: s.status === 'CRITICAL' || s.status === 'CONGESTED'
                  }))
                : [{ label: 'Sector Data', value: 'No sector data in current database snapshot' }]
            },
            {
              heading: 'Gate Activity Log',
              rows: crowd.gates.length > 0
                ? crowd.gates.map(g => ({
                    label: g.name,
                    value: `Queue: ${g.queueTimeMin} min | Flow: ${g.flowRatePpm} ppm | Status: ${g.status}`,
                    highlight: g.status === 'CRITICAL'
                  }))
                : [{ label: 'Gate Data', value: 'No gate data in current database snapshot' }]
            }
          ]
        );
      }
    },
    {
      id: 'rep-002',
      name: 'Smart Power Grid & Solar Offset Report',
      date: today,
      size: '1.8 MB',
      category: 'Sustainability',
      icon: Zap,
      iconColor: 'text-amber-500',
      generate: () => buildHtmlReport(
        'Smart Power Grid & Solar Offset Report',
        'Sustainability',
        today,
        [
          {
            heading: 'Energy Grid Performance',
            rows: [
              { label: 'Live Energy Draw', value: `${sustainability.liveEnergyUsageKw.toLocaleString()} kW`, highlight: true },
              { label: 'Peak Energy Demand', value: `${sustainability.peakEnergyUsageKw.toLocaleString()} kW` },
              { label: 'Solar Grid Contribution', value: `${sustainability.solarContributionPercent}%`, highlight: true },
              { label: 'Carbon Emission (Total)', value: `${sustainability.carbonEmissionKg.toLocaleString()} kg` },
              { label: 'Carbon Offsets Applied', value: `${sustainability.carbonOffsetsKg.toLocaleString()} kg`, highlight: true },
            ]
          },
          {
            heading: 'Water & Waste Management',
            rows: [
              { label: 'Water Consumption', value: `${sustainability.waterConsumptionLiters.toLocaleString()} L` },
              { label: 'Reclaimed Water %', value: `${sustainability.reclaimedWaterPercent}%`, highlight: true },
              { label: 'Waste Generated', value: `${sustainability.wasteGeneratedTons} tons` },
              { label: 'Recycling Rate', value: `${sustainability.recyclingRatePercent}%`, highlight: true },
            ]
          },
          {
            heading: 'Spectator Transit Split',
            rows: [
              { label: 'Metro/Rail', value: `${sustainability.transportModes.metro}%`, highlight: true },
              { label: 'Bus Shuttle', value: `${sustainability.transportModes.busShuttle}%` },
              { label: 'Rideshare / App Taxi', value: `${sustainability.transportModes.rideshare}%` },
              { label: 'Personal Vehicle', value: `${sustainability.transportModes.personalCar}%` },
            ]
          }
        ]
      )
    },
    {
      id: 'rep-003',
      name: 'Incident Dispatch & Medical Log Archives',
      date: today,
      size: '4.2 MB',
      category: 'Security',
      icon: Shield,
      iconColor: 'text-red-500',
      generate: () => {
        const active = incidents.filter(i => i.status !== 'RESOLVED').length;
        const resolved = incidents.filter(i => i.status === 'RESOLVED').length;
        const critical = incidents.filter(i => i.severity === 'CRITICAL' || i.severity === 'HIGH').length;
        return buildHtmlReport(
          'Incident Dispatch & Medical Log Archives',
          'Security',
          today,
          [
            {
              heading: 'Incident Dashboard Summary',
              rows: [
                { label: 'Total Incidents Logged', value: String(incidents.length) },
                { label: 'Currently Active', value: String(active), highlight: active > 0 },
                { label: 'Resolved', value: String(resolved), highlight: true },
                { label: 'Critical / High Severity', value: String(critical), highlight: critical > 0 },
              ]
            },
            {
              heading: 'Incident Log (Most Recent 10)',
              rows: incidents.slice(0, 10).map(inc => ({
                label: `[${inc.severity}] ${inc.category} — ${inc.location}`,
                value: `${inc.status} · ${new Date(inc.reportedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`,
                highlight: inc.severity === 'CRITICAL'
              }))
            }
          ]
        );
      }
    },
    {
      id: 'rep-004',
      name: 'FIFA World Cup Match Fixture Data',
      date: today,
      size: '3.1 MB',
      category: 'Transport',
      icon: BarChart2,
      iconColor: 'text-blue-500',
      generate: () => buildHtmlReport(
        'FIFA World Cup Match Fixture Data',
        'Transport',
        today,
        [
          {
            heading: 'Match Schedule Summary',
            rows: matches.length > 0 ? [
              { label: 'Total Fixtures in Database', value: String(matches.length) },
              { label: 'Live / In-Progress', value: String(matches.filter(m => m.status === 'LIVE').length), highlight: true },
              { label: 'Scheduled (Upcoming)', value: String(matches.filter(m => m.status === 'SCHEDULED').length) },
              { label: 'Completed', value: String(matches.filter(m => m.status === 'FINISHED').length) },
            ] : [{ label: 'Fixtures', value: 'No match data in current database snapshot' }]
          },
          {
            heading: 'Match Results Log',
            rows: matches.slice(0, 15).map(m => ({
              label: `${m.homeTeam} vs ${m.awayTeam} — ${m.stadium}`,
              value: `${m.homeScore} – ${m.awayScore} · ${m.status} · ${new Date(m.dateTime).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`,
              highlight: m.status === 'LIVE'
            }))
          }
        ]
      )
    }
  ];

  const handleDownload = (rep: typeof reportItems[0]) => {
    setExportingId(rep.id);
    setTimeout(() => {
      const html = rep.generate();
      const safeName = rep.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      triggerDownload(html, `aegisstadium-${safeName}-${Date.now()}.html`);
      setExportingId(null);
    }, 800);
  };

  // Summary KPI data
  const totalIncidents = incidents.length;
  const activeIncidents = incidents.filter(i => i.status !== 'RESOLVED').length;
  const liveMatches = matches.filter(m => m.status === 'LIVE').length;

  return (
    <div className="space-y-6 font-sans">

      {/* HEADER */}
      <div className="flex justify-between items-center bg-white dark:bg-graphite-900 p-4 rounded-xl border border-gray-150 dark:border-graphite-800 shadow-premium">
        <div>
          <h2 className="text-base font-bold text-gray-800 dark:text-white">Tournament Operations Shift Audit Reports</h2>
          <p className="text-xs text-gray-400 font-medium">Download live-data reports as richly formatted HTML files. Open in any browser and print to PDF.</p>
        </div>
        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 rounded-full uppercase tracking-wider">
          Live Data
        </span>
      </div>

      {/* KPI STRIP */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Incidents', value: totalIncidents, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/10', border: 'border-red-200 dark:border-red-800' },
          { label: 'Active Incidents', value: activeIncidents, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/10', border: 'border-amber-200 dark:border-amber-800' },
          { label: 'Live Matches', value: liveMatches, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/10', border: 'border-emerald-200 dark:border-emerald-800' },
          { label: 'Occupancy %', value: `${crowd.occupancyPercentage.toFixed(0)}%`, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/10', border: 'border-blue-200 dark:border-blue-800' },
        ].map((k, i) => (
          <div key={i} className={`${k.bg} border ${k.border} rounded-xl p-4 shadow-premium`}>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{k.label}</p>
            <p className={`text-2xl font-black ${k.color}`}>{k.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* REPORT LIST */}
        <div className="lg:col-span-2 bg-white dark:bg-graphite-900 border border-gray-150 dark:border-graphite-800 rounded-xl p-5 shadow-premium space-y-1">
          <div className="flex items-center space-x-2 mb-4">
            <FileText className="w-4 h-4 text-forest-500" />
            <h3 className="text-xs font-bold text-gray-700 dark:text-white uppercase tracking-wider">Available Reports</h3>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-graphite-800">
            {reportItems.map((rep) => {
              const Icon = rep.icon;
              const isExporting = exportingId === rep.id;
              return (
                <div key={rep.id} className="py-4 flex justify-between items-center gap-4">
                  <div className="flex items-start space-x-3 min-w-0">
                    <div className={`w-8 h-8 rounded-lg bg-gray-50 dark:bg-graphite-800 flex items-center justify-center shrink-0`}>
                      <Icon className={`w-4 h-4 ${rep.iconColor}`} />
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-gray-800 dark:text-gray-200 text-xs block truncate">{rep.name}</span>
                      <span className="text-[10px] text-gray-400 font-semibold">
                        Date: {rep.date} · Category: {rep.category}
                      </span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block mt-0.5">
                        ✓ Live data snapshot included
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDownload(rep)}
                    disabled={exportingId !== null}
                    className={`shrink-0 flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      isExporting
                        ? 'bg-forest-500 text-white border border-forest-600'
                        : 'border border-gray-200 dark:border-graphite-700 hover:bg-forest-500 hover:text-white hover:border-forest-600 text-gray-600 dark:text-gray-400'
                    } disabled:opacity-50`}
                  >
                    <Download className={`w-3.5 h-3.5 ${isExporting ? 'animate-bounce' : ''}`} />
                    <span>{isExporting ? 'Exporting…' : 'Export HTML'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI BRIEFING PANEL */}
        <div className="bg-forest-950 text-white rounded-xl p-5 border border-forest-800 shadow-premium relative overflow-hidden flex flex-col">
          <div className="absolute top-0 right-0 w-32 h-32 bg-forest-900/30 rounded-full filter blur-xl pointer-events-none" />

          <div className="relative z-10 space-y-4 flex-1">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-emerald-500 animate-pulse" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-forest-200">AI Shift Executive Summary</h3>
            </div>

            <div className="p-3.5 bg-forest-900/40 rounded-lg border border-forest-800 space-y-3">
              <p className="font-bold text-white text-xs">Live Operational Snapshot</p>
              <div className="space-y-2 text-[11px] leading-relaxed text-forest-100">
                <p>🏟️ Stadium occupancy is at <span className="text-emerald-400 font-bold">{crowd.occupancyPercentage.toFixed(1)}%</span> with <span className="text-white font-bold">{crowd.totalOccupancy.toLocaleString()} fans</span> present.</p>
                <p>⚡ Live energy draw is <span className="text-amber-400 font-bold">{sustainability.liveEnergyUsageKw.toLocaleString()} kW</span> with solar offsetting <span className="text-emerald-400 font-bold">{sustainability.solarContributionPercent}%</span> of demand.</p>
                <p>🚨 <span className="text-white font-bold">{activeIncidents} active incident{activeIncidents !== 1 ? 's' : ''}</span> under monitoring from a total of {totalIncidents} reported.</p>
                {liveMatches > 0 && (
                  <p>⚽ <span className="text-emerald-400 font-bold">{liveMatches} match{liveMatches !== 1 ? 'es' : ''}</span> currently LIVE.</p>
                )}
              </div>
            </div>

            <div className="p-3 bg-forest-900/20 rounded-lg border border-forest-800/50">
              <p className="text-[10px] text-forest-300 font-semibold leading-relaxed">
                💡 <strong className="text-white">Export Tip</strong>: Downloaded HTML reports can be opened in Chrome or Edge and printed (Ctrl+P → Save as PDF) for archiving.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Reports;
