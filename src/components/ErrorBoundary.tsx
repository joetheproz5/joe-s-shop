import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback
      return (
        <div className="min-h-[60vh] flex items-center justify-center p-6">
          <div className="glass-card max-w-md w-full text-center">
            <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-danger-100 dark:bg-danger-900/30 flex items-center justify-center">
              <AlertTriangle className="text-danger-600 dark:text-danger-400" size={28} />
            </div>
            <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
            <p className="text-surface-600 dark:text-surface-400 text-sm mb-6">
              {this.state.error?.message || 'An unexpected error occurred. Please try again.'}
            </p>
            <button onClick={this.handleReset} className="btn-primary">
              <RefreshCw size={16} />
              Try Again
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
