import React from 'react';

export const SystemError: React.FC = () => {
  return (
    <div className="min-h-screen w-full bg-[#0A0A0A] text-white flex flex-col items-center justify-center p-6 text-center font-sans select-none fixed inset-0 z-[99999]">
      <div className="max-w-md w-full flex flex-col items-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-1">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
          An error has occurred
        </h1>
        <p className="text-sm text-gray-400 max-w-sm">
          Something went wrong while loading this page. Please try again later.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-3 px-5 py-2.5 rounded-lg bg-white/10 hover:bg-white/15 active:bg-white/5 border border-white/10 text-white text-xs font-medium transition-colors cursor-pointer"
        >
          Reload page
        </button>
      </div>
    </div>
  );
};
