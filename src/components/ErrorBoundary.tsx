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
        <div className="min-h-screen bg-bg-deep text-text-1 flex items-center justify-center p-6 font-sans">
          <div className="xp-card max-w-2xl w-full p-8">
            <div className="flex items-center gap-4 mb-8">
              <div
                className="w-16 h-16 flex items-center justify-center"
                style={{ border: '1px solid var(--color-xp-border-red)', color: 'var(--color-xp-red)' }}
              >
                <AlertTriangle className="w-8 h-8" />
              </div>
              <div>
                <div className="xp-section-label">— Error —</div>
                <h1 className="xp-display text-3xl mt-1">
                  Something <span style={{ color: 'var(--color-xp-red)' }}>went wrong</span>
                </h1>
                <p className="text-text-2 text-sm mt-1">The application encountered an unexpected error.</p>
              </div>
            </div>

            <div className="bg-bg-input border border-border p-6 mb-8 overflow-hidden">
              <h2 className="xp-section-label text-[10px] mb-4">Error Details</h2>
              <pre className="text-sm font-mono whitespace-pre-wrap break-all max-h-60 overflow-y-auto" style={{ color: 'var(--color-xp-red)' }}>
                {this.state.errorInfo || this.state.error?.message || 'Unknown error'}
              </pre>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={this.handleReset}
                className="btn-xp-primary flex-1"
              >
                <RefreshCw className="w-5 h-5" />
                Reload Application
              </button>
              <a
                href="/admin"
                className="btn-xp-outline flex-1"
              >
                <Home className="w-5 h-5" />
                Back to Dashboard
              </a>
            </div>

            <p className="mt-8 text-center text-text-3 font-mono text-[10px] tracking-[0.15em] uppercase">
              If this issue persists, capture the error details above for review.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
