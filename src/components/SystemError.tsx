import React, { useState, useEffect } from 'react';

export const SystemError: React.FC = () => {
  const [traceId, setTraceId] = useState('');
  const [timestamp, setTimestamp] = useState('');

  useEffect(() => {
    // Generate realistic trace ID and timestamp
    const randomHex = () => Math.random().toString(36).substring(2, 8);
    setTraceId(`req_${randomHex()}-${randomHex()}-ap-south-1`);
    setTimestamp(new Date().toISOString());
  }, []);

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen w-full bg-[#0B0F19] text-[#E2E8F0] flex flex-col items-center justify-center p-4 sm:p-6 font-sans select-none">
      <div className="max-w-lg w-full bg-[#111827] border border-[#1F2937] rounded-xl p-6 sm:p-8 shadow-2xl">
        {/* Top Status Header */}
        <div className="flex items-center justify-between border-b border-[#1F2937] pb-4 mb-6">
          <div className="flex items-center space-x-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
            <span className="text-xs font-mono font-semibold tracking-wider text-red-400 uppercase">
              500 Internal Server Error
            </span>
          </div>
          <span className="text-[11px] font-mono text-gray-500">
            HTTP 500
          </span>
        </div>

        {/* Error Main Body */}
        <div className="space-y-3 mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Application Service Unavailable
          </h1>
          <p className="text-sm text-gray-400 leading-relaxed">
            The server encountered an unexpected error while processing core runtime services. The application host is currently unreachable.
          </p>
        </div>

        {/* Technical Diagnostic Box */}
        <div className="bg-[#030712] border border-[#1F2937]/80 rounded-lg p-4 font-mono text-xs text-gray-300 space-y-1.5 mb-6 overflow-hidden">
          <div className="flex justify-between items-center text-gray-400 border-b border-gray-800/80 pb-2 mb-2">
            <span className="font-semibold text-gray-300">System Diagnostics</span>
            <span className="text-[10px] bg-red-950/40 text-red-400 px-2 py-0.5 rounded border border-red-900/30">FAILED</span>
          </div>
          <p className="text-gray-400">
            Status: <span className="text-red-400 font-semibold">500 (Internal Server Error)</span>
          </p>
          <p className="text-gray-400">
            Reason: <span className="text-gray-300">ERR_HTTP_SERVICE_UNAVAILABLE</span>
          </p>
          <p className="text-gray-400 truncate">
            Trace ID: <span className="text-gray-300">{traceId || 'req_init_gateway_failure'}</span>
          </p>
          <p className="text-gray-400">
            Node: <span className="text-gray-300">prod-gateway-ap-south-1a</span>
          </p>
          <p className="text-gray-500 text-[10px] pt-1">
            Timestamp: {timestamp || 'Syncing...'}
          </p>
        </div>

        {/* Action Button */}
        <div className="space-y-3">
          <button
            onClick={handleReload}
            className="w-full bg-[#1E293B] hover:bg-[#334155] active:bg-[#0F172A] border border-[#334155] text-white text-xs font-semibold py-3 px-4 rounded-lg transition-all duration-150 flex items-center justify-center space-x-2 cursor-pointer shadow-sm"
          >
            <svg
              className="w-3.5 h-3.5 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span>Reload Application</span>
          </button>
          
          <p className="text-center text-[11px] text-gray-500 font-sans">
            If this issue persists, please try again later.
          </p>
        </div>
      </div>
    </div>
  );
};
