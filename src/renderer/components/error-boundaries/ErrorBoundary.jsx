/**
 * Error Boundary
 * 
 * React Error Boundary component that catches JavaScript errors anywhere in the
 * child component tree and displays a fallback UI instead of crashing.
 * 
 * @module components/error-boundaries/ErrorBoundary
 */

import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render shows the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('[ErrorBoundary] Caught error:', error);
    console.error('[ErrorBoundary] Component stack:', errorInfo.componentStack);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-8">
          <div className="bg-gray-800 rounded-lg p-8 max-w-2xl w-full">
            <h1 className="text-3xl font-bold text-red-400 mb-4">
              Something went wrong
            </h1>
            
            <p className="text-gray-300 mb-4">
              The application encountered an error. You can try reloading or resetting.
            </p>

            {this.state.error && (
              <div className="bg-gray-900 rounded p-4 mb-4 overflow-auto">
                <p className="text-red-300 font-mono text-sm">
                  {this.state.error.toString()}
                </p>
                {this.state.errorInfo && (
                  <pre className="text-gray-500 text-xs mt-2 overflow-x-auto">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={this.handleReset}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded font-medium transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={this.handleReload}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 rounded font-medium transition-colors"
              >
                Reload App
              </button>
            </div>

            <p className="mt-4 text-sm text-gray-500">
              Press B button or ESC to go back
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
