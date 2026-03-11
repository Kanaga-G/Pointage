import React, { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    this.setState({
      error,
      errorInfo
    })

    // Appeler le callback onError si fourni
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // Logger l'erreur pour le débogage
    this.logErrorToService(error, errorInfo)
  }

  private logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    // Envoyer les erreurs à un service de logging (optionnel)
    try {
      const errorData = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      }

      // Envoyer à un endpoint de logging ou à un service externe
      // En production, vous pourriez envoyer à un service de monitoring
      if (false) { // Désactivé pour le développement
        // Exemple: fetch('/api/errors', { method: 'POST', body: JSON.stringify(errorData) })
        console.log('Error logged:', errorData)
      }
    } catch (loggingError) {
      console.error('Failed to log error:', loggingError)
    }
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  private handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      // Si un fallback personnalisé est fourni, l'utiliser
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Interface d'erreur par défaut
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
            <div className="text-center">
              <div className="mb-4">
                <i className="fas fa-exclamation-triangle text-5xl text-warning mb-4" />
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Oups ! Une erreur est survenue
                </h1>
                <p className="text-gray-600 mb-6">
                  Nous sommes désolés, une erreur inattendue s'est produite. 
                  Nos équipes ont été notifiées et travaillent à résoudre le problème.
                </p>
              </div>

              {true && this.state.error && (
                <details className="mb-6 text-left">
                  <summary className="cursor-pointer text-sm font-mono bg-gray-100 p-2 rounded hover:bg-gray-200">
                    Détails techniques (développement)
                  </summary>
                  <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded text-sm">
                    <div className="mb-2">
                      <strong>Erreur:</strong>
                      <pre className="mt-1 text-xs bg-white p-2 rounded border overflow-auto">
                        {this.state.error.message}
                      </pre>
                    </div>
                    {this.state.error.stack && (
                      <div className="mb-2">
                        <strong>Stack:</strong>
                        <pre className="mt-1 text-xs bg-white p-2 rounded border overflow-auto max-h-32">
                          {this.state.error.stack}
                        </pre>
                      </div>
                    )}
                    {this.state.errorInfo?.componentStack && (
                      <div>
                        <strong>Component Stack:</strong>
                        <pre className="mt-1 text-xs bg-white p-2 rounded border overflow-auto max-h-32">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}

              <div className="flex gap-3 justify-center">
                <button
                  onClick={this.handleRetry}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                >
                  <i className="fas fa-redo mr-2" />
                  Réessayer
                </button>
                <button
                  onClick={this.handleReload}
                  className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary-dark transition-colors"
                >
                  <i className="fas fa-sync mr-2" />
                  Recharger la page
                </button>
              </div>

              <div className="mt-6 text-sm text-gray-500">
                <p>
                  Si le problème persiste, veuillez contacter le support technique.
                </p>
                <p className="mt-1">
                  Référence d'erreur: {Date.now().toString(36)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Hook pour gérer les erreurs dans les composants fonctionnels
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null)

  React.useEffect(() => {
    if (error) {
      throw error
    }
  }, [error])

  const handleError = React.useCallback((error: Error) => {
    setError(error)
  }, [])

  return handleError
}

// Composant d'erreur pour les erreurs asynchrones
export function AsyncErrorBoundary({ 
  children, 
  fallback 
}: { 
  children: ReactNode
  fallback?: ReactNode 
}) {
  const handleError = useErrorHandler()

  React.useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason)
      handleError(new Error(event.reason?.message || 'Promise rejected'))
    }

    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [handleError])

  return (
    <ErrorBoundary fallback={fallback}>
      {children}
    </ErrorBoundary>
  )
}

export default ErrorBoundary
