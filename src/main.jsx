import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { initSentry, Sentry } from './lib/sentry';

initSentry();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Sentry.ErrorBoundary fallback={<div className="min-h-screen bg-[#07080a] text-white flex items-center justify-center p-6 text-center font-sans"><h2>Something went wrong. Please refresh the page.</h2></div>}>
      <App />
    </Sentry.ErrorBoundary>
  </React.StrictMode>
);
