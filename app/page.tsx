'use client';

import React, { useState } from 'react';
import Papa from 'papaparse';
import { Upload, Sparkles, CheckCircle2, ShieldCheck, Mail, ArrowRight, Loader2 } from 'lucide-react';

export default function Home() {
  const [csvData, setCsvData] = useState<any[]>([]);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState('');
  const [approved, setApproved] = useState(false);
  const [draftId, setDraftId] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results: any) => {
        setCsvData(results.data);
      },
    });
  };

  const handleAnalyze = async () => {
    if (csvData.length === 0) return;
    setLoading(true);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviews: csvData }),
      });
      const data = await res.json();
      setOutput(data.analysis || 'Analysis generated successfully.');
    } catch (err) {
      console.error(err);
      setOutput('Error running AI analysis.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    setApproved(true);
    try {
      const res = await fetch('/api/gmail/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: 'Groww Weekly Product Pulse & Review Summary',
          body: output,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setDraftId(data.draftId);
      } else {
        console.error(data.error);
      }
    } catch (err) {
      console.error('Failed to create draft:', err);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center py-12 px-4 selection:bg-emerald-500 selection:text-white">
      <div className="w-full max-w-4xl space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5" /> Groww Product Intelligence & MCP Approval Engine
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white">Review Analytics & Action Gate</h1>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Upload user reviews CSV, extract friction points regarding mutual funds and exit loads, and execute verified Gmail draft workflows.
          </p>
        </div>

        {/* Upload Card */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md">
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-700 hover:border-emerald-500/50 rounded-xl p-8 cursor-pointer transition-all bg-slate-950/40">
            <Upload className="w-10 h-10 text-emerald-400 mb-3" />
            <span className="text-sm font-medium text-slate-200">
              {fileName ? `Loaded: ${fileName}` : 'Drop your reviews CSV here or click to browse'}
            </span>
            <span className="text-xs text-slate-500 mt-1">Supports standard CSV review extracts</span>
            <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
          </label>

          {csvData.length > 0 && (
            <div className="mt-6 flex items-center justify-between">
              <span className="text-xs text-emerald-400 font-medium">
                ✓ {csvData.length} records parsed successfully
              </span>
              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Run AI Intelligence Analysis
              </button>
            </div>
          )}
        </div>

        {/* AI Output Section */}
        {output && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" /> Actionable Product Insights
              </h2>
              <span className="text-xs px-2.5 py-1 rounded-md bg-slate-800 text-slate-300">OpenRouter LLM</span>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 text-sm text-slate-300 whitespace-pre-wrap font-mono leading-relaxed">
              {output}
            </div>

            {/* MCP Human-in-the-loop Approval Gate */}
            <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold text-emerald-300">MCP Action Approval Gate</h3>
                <p className="text-xs text-slate-400">Approve automated sync to create draft in your connected Gmail account.</p>
              </div>

              {!approved ? (
                <button
                  onClick={handleApprove}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm transition-all flex items-center gap-2 shadow-lg"
                >
                  <CheckCircle2 className="w-4 h-4" /> Approve & Execute MCP Action
                </button>
              ) : (
                <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20">
                  <Mail className="w-4 h-4" /> {draftId ? `Draft Created Successfully (ID: ${draftId.slice(0, 8)}...)` : 'Creating Gmail Draft via API...'}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
