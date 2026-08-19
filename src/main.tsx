import { Component, ErrorInfo, ReactNode, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="max-w-md bg-[#111111] border border-[#D4AF37]/40 p-8 rounded-sm shadow-2xl flex flex-col items-center gap-6">
            <h1 className="text-2xl font-serif text-[#D4AF37] uppercase tracking-wider">Concierge System Ready</h1>
            <p className="text-sm text-gray-300">Click below to clear cached session files and launch your clean Hairport Queue System.</p>
            {this.state.error && (
              <p className="text-xs text-gray-500 font-mono bg-black/50 p-2 rounded max-w-xs break-all">
                {this.state.error.message || String(this.state.error)}
              </p>
            )}
            <button
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              className="bg-[#D4AF37] text-black font-bold uppercase text-xs px-6 py-3 rounded-sm tracking-widest hover:bg-[#C5A059] transition-colors cursor-pointer"
            >
              Reset & Reload System
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
