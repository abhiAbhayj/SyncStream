import React from 'react';
import { RotateCcw, AlertCircle, Home, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary caught error]:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleResetAndReload = () => {
    try {
      sessionStorage.clear();
      localStorage.removeItem('syncstream_theme');
      localStorage.removeItem('syncstream_favorites_order');
      localStorage.removeItem('syncstream_last_track');
    } catch {}
    window.location.href = '/';
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center select-none animate-fade-in">
          <div className="p-4 rounded-2xl bg-red-500/15 border-2 border-red-500/30 text-red-400 mb-4 shadow-[0_0_30px_rgba(239,68,68,0.25)]">
            <AlertCircle className="w-10 h-10 animate-bounce" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white font-outfit mb-2">
            Something went sideways
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 max-w-md mb-4 leading-relaxed">
            SyncStream encountered a temporary rendering hitch. You can reload this view or return to the home sanctuary.
          </p>

          {/* Diagnostic Details */}
          {this.state.error && (
            <div className="mb-6 p-4 rounded-xl bg-black/80 border border-red-500/40 text-red-300 font-mono text-xs max-w-xl w-full text-left overflow-auto max-h-48 shadow-inner select-text">
              <div className="font-bold text-red-400 mb-1">
                {this.state.error.name}: {this.state.error.message}
              </div>
              {this.state.error.stack && (
                <pre className="text-[10px] text-gray-400 mt-1 whitespace-pre-wrap leading-tight">
                  {this.state.error.stack}
                </pre>
              )}
            </div>
          )}

          <div className="flex items-center gap-3 flex-wrap justify-center">
            <button
              onClick={this.handleReload}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-accentCyan to-accentPurple text-black font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-accentPurple/25 hover:opacity-90 active:scale-95 transition"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reload App</span>
            </button>
            <button
              onClick={this.handleResetAndReload}
              className="px-4 py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 font-bold text-xs sm:text-sm flex items-center gap-2 active:scale-95 transition"
              title="Clear cached state and reload"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reset &amp; Reload</span>
            </button>
            <button
              onClick={this.handleGoHome}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-xs sm:text-sm flex items-center gap-2 active:scale-95 transition"
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
