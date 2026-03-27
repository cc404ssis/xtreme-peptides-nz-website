import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: string | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    
    // Try to parse the error message if it's our custom Firestore error JSON
    let detailedInfo = null;
    try {
      detailedInfo = JSON.parse(error.message);
    } catch (e) {
      // Not a JSON error
    }

    this.setState({
      error,
      errorInfo: detailedInfo ? JSON.stringify(detailedInfo, null, 2) : error.message
    });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#050b14] flex items-center justify-center p-6 font-sans">
          <div className="max-w-2xl w-full bg-[#0a1628] border border-[#1a3a5c] rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-red-400/10 rounded-2xl flex items-center justify-center text-red-400">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Something went wrong</h1>
                <p className="text-[#8b9cb5]">The application encountered an unexpected error.</p>
              </div>
            </div>

            <div className="bg-[#050b14] border border-[#1a3a5c] rounded-2xl p-6 mb-8 overflow-hidden">
              <h2 className="text-xs font-bold text-[#8b9cb5] uppercase tracking-widest mb-4">Error Details</h2>
              <pre className="text-sm text-red-400 font-mono whitespace-pre-wrap break-all max-h-60 overflow-y-auto">
                {this.state.errorInfo || this.state.error?.message || 'Unknown error'}
              </pre>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={this.handleReset}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-[#00d4ff] text-[#050b14] rounded-2xl font-bold hover:shadow-lg hover:shadow-[#00d4ff]/20 transition-all"
              >
                <RefreshCw className="w-5 h-5" />
                Reload Application
              </button>
              <a
                href="/admin"
                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-[#1a2a3a] text-white rounded-2xl font-bold hover:bg-[#2a3a4a] transition-all border border-[#1a3a5c]"
              >
                <Home className="w-5 h-5" />
                Back to Dashboard
              </a>
            </div>
            
            <p className="mt-8 text-center text-[#5a6a7d] text-xs">
              If this issue persists, please contact support with the error details above.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
