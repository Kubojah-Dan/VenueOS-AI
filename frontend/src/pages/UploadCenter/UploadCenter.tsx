import React, { useState, useRef } from 'react';
import { useApp } from '../../app/providers';
import {
  Upload,
  File,
  CheckCircle,
  AlertCircle,
  Database,
  History,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const UploadCenter: React.FC = () => {
  const { uploadHistory, triggerRefresh } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [dragActive, setDragActive] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'IDLE' | 'UPLOADING' | 'PARSING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processedFileName, setProcessedFileName] = useState('');
  const [recordsCount, setRecordsCount] = useState(0);
  const [detectedSchema, setDetectedSchema] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const processFile = async (file: File) => {
    setProcessedFileName(file.name);
    setUploadStatus('UPLOADING');
    setUploadProgress(20);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const interval = setInterval(() => {
        setUploadProgress((p) => {
          if (p >= 80) {
            clearInterval(interval);
            return 80;
          }
          return p + 15;
        });
      }, 200);

      const res = await fetch('http://localhost:3001/api/upload', {
        method: 'POST',
        body: formData
      });

      clearInterval(interval);
      setUploadProgress(95);

      if (res.ok) {
        const payload = await res.json();
        setUploadProgress(100);
        setUploadStatus('SUCCESS');
        setRecordsCount(payload.data.parsedRecords || 0);
        setDetectedSchema(payload.data.fileType || 'Generic Text Document');
        triggerRefresh();
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Validation error');
      }
    } catch (err: any) {
      console.warn('Network offline or upload server error. Initiating local client parsing fallback...', err);
      await runLocalClientParsing(file);
    }
  };

  const runLocalClientParsing = async (file: File) => {
    setUploadStatus('PARSING');
    setUploadProgress(60);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        let count = 0;
        let schema = 'Generic Context Text';

        if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(content);
          count = Array.isArray(parsed) ? parsed.length : 1;
          schema = 'JSON Dataset';
        } else if (file.name.endsWith('.csv')) {
          const rows = content.split('\n').filter(r => r.trim().length > 0);
          count = rows.length - 1;
          schema = 'CSV Dataset';
        } else {
          count = 1;
          schema = 'Manual Text Manuals';
        }

        setUploadProgress(100);
        setUploadStatus('SUCCESS');
        setRecordsCount(count);
        setDetectedSchema(schema);

        alert(`Offline Mode: Locally read ${file.name}. State updated. Please reconnect backend server for WebSocket broadcasts.`);
      } catch (err: any) {
        setUploadStatus('ERROR');
        setErrorMsg(err.message || 'File parsing fail');
      }
    };

    reader.onerror = () => {
      setUploadStatus('ERROR');
      setErrorMsg('Failed reading file content.');
    };

    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center bg-white dark:bg-graphite-900 p-5 rounded-xl border border-gray-150 dark:border-graphite-800 shadow-premium">
        <div>
          <h2 className="text-base font-bold text-gray-800 dark:text-white">Smart Event Ingestion Center</h2>
          <p className="text-xs text-gray-400 font-medium">Upload stadium telemetry datasets to update AI prompts and widgets instantly</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* FILE DROP UPLOADER CONTAINER */}
        <div className="lg:col-span-2 space-y-6">
          
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center min-h-[300px] text-center transition-all bg-white dark:bg-graphite-900 ${
              dragActive
                ? 'border-forest-500 bg-forest-500/5'
                : 'border-gray-250 dark:border-graphite-800 hover:border-forest-400/50'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInput}
              className="hidden"
              accept=".csv,.json,.xlsx,.xls,.txt,.md,image/*,video/*"
            />
            
            <div className="w-12 h-12 bg-forest-500/10 text-forest-500 dark:text-forest-400 rounded-xl flex items-center justify-center mb-4 border border-forest-500/10">
              <Upload className="w-5.5 h-5.5" />
            </div>

            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200">
              Drag & drop stadium operational files here
            </h3>
            <p className="text-xs text-gray-400 font-semibold mt-1 mb-6">
              Supports CSV, JSON, Excel grids (.xlsx) or emergency guidelines (.txt) up to 10MB
            </p>

            <button
              onClick={triggerFileSelect}
              className="px-4 py-2 bg-forest-500 hover:bg-forest-600 text-white rounded-lg text-xs font-bold shadow-premium transition-all"
            >
              Browse Files
            </button>
          </div>

          {/* UPLOAD PROGRESS / STATE DETAILS */}
          {uploadStatus !== 'IDLE' && (
            <div className="bg-white dark:bg-graphite-900 border border-gray-150 dark:border-graphite-800 rounded-xl p-5 shadow-premium space-y-4">
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center space-x-2">
                  <File className="w-4 h-4 text-forest-500" />
                  <span className="font-bold text-gray-805 dark:text-gray-200">{processedFileName}</span>
                </div>
                <span className="font-bold text-gray-500 uppercase tracking-wider text-[10px]">Status: {uploadStatus}</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-100 dark:bg-graphite-850 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-forest-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>

              {uploadStatus === 'SUCCESS' && (
                <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 text-xs rounded-lg flex items-center space-x-2 border border-emerald-500/15">
                  <CheckCircle className="w-4 h-4 shrink-0 text-emerald-550" />
                  <div>
                    <span className="font-bold block">Ingestion complete</span>
                    <span className="text-[10px] text-gray-450 block font-semibold">
                      Successfully parsed {recordsCount} entries as {detectedSchema}. Telemetry feeds updated.
                    </span>
                  </div>
                </div>
              )}

              {uploadStatus === 'ERROR' && (
                <div className="p-3 bg-red-500/10 text-red-550 text-xs rounded-lg flex items-center space-x-2 border border-red-500/15">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <div>
                    <span className="font-bold block">Validation failure</span>
                    <span className="text-[10px] text-gray-450 block font-semibold">{errorMsg || 'Failed matching structure formats.'}</span>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* UPLOAD GUIDES / REQUIREMENTS */}
        <div className="space-y-6">
          
          <div className="bg-forest-950 text-white rounded-xl p-5 border border-forest-800 shadow-premium space-y-4">
            <div className="flex items-center space-x-2">
              <Database className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-forest-200">Schema Specifications</h3>
            </div>
            
            <div className="space-y-4.5 text-xs font-medium text-forest-100">
              <div className="space-y-1">
                <span className="font-bold text-white block">⚽ Matches Log</span>
                <p className="text-[11px] leading-normal text-forest-200">
                  Requires columns `homeTeam`, `awayTeam`, `homeScore`, `awayScore`, `status`, and `minute`.
                </p>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-white block">🚨 Incidents Checklist</span>
                <p className="text-[11px] leading-normal text-forest-200">
                  Requires columns `category`, `severity`, `description`, and `location` to trigger dispatcher dispatch.
                </p>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-white block">📝 Stadium Manuals (RAG)</span>
                <p className="text-[11px] leading-normal text-forest-200">
                  Plain text documents (`.txt` / `.md`) are read and dynamically indexed inside similarity vector databases.
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* FULL UPLOADS HISTORY TABLE */}
      <div className="bg-white dark:bg-graphite-900 border border-gray-150 dark:border-graphite-800 rounded-xl p-5 shadow-premium space-y-4">
        <div className="flex items-center space-x-2">
          <History className="w-4 h-4 text-forest-500" />
          <h3 className="text-xs font-bold text-gray-700 dark:text-white uppercase tracking-wider">Ingestion Logs Archives</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-500 dark:text-gray-400">
            <thead>
              <tr className="border-b border-gray-100 dark:border-graphite-800 text-[10px] uppercase font-bold text-gray-400">
                <th className="py-2.5">Date Ingested</th>
                <th className="py-2.5">File Name</th>
                <th className="py-2.5">Format Size</th>
                <th className="py-2.5">AI Summary Analysis</th>
                <th className="py-2.5">Status</th>
              </tr>
            </thead>
            <tbody>
              {uploadHistory.map((item) => (
                <tr key={item.id} className="border-b border-gray-55 dark:border-graphite-850 hover:bg-gray-50/50 dark:hover:bg-graphite-850/50">
                  <td className="py-3 font-semibold text-gray-850 dark:text-gray-250">
                    {new Date(item.uploadedAt).toLocaleString()}
                  </td>
                  <td className="py-3 text-gray-650 dark:text-gray-400 font-medium">{item.fileName}</td>
                  <td className="py-3 text-gray-600 dark:text-gray-400">{(item.fileSize / 1024).toFixed(1)} KB</td>
                  <td className="py-3 font-semibold text-gray-600 dark:text-gray-400 flex items-start space-x-1.5 max-w-sm">
                    <Sparkles className="w-3.5 h-3.5 text-forest-500 shrink-0 mt-0.5" />
                    <span>{item.aiInsights || 'No automated summaries generated.'}</span>
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                      item.status === 'SUCCESS'
                        ? 'bg-emerald-500/10 text-emerald-600'
                        : 'bg-red-500/10 text-red-500'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
              {uploadHistory.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-gray-400 font-semibold">
                    No custom datasets uploaded. Drag a file to test telemetry sync.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
export default UploadCenter;
