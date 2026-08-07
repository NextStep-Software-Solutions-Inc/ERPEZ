/**
 * Error Boundary for Annual Performance Planning Module
 * 
 * Provides graceful error handling and fallback UI for APP components
 * Follows UACS patterns for error management
 */

import React, { Component, ReactNode } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

interface AppErrorFallbackProps {
  error: Error
  resetErrorBoundary: () => void
}

function AppErrorFallback({ error, resetErrorBoundary }: AppErrorFallbackProps) {
  return (
    <Card className="max-w-2xl mx-auto mt-8">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <AlertTriangle className="w-12 h-12 text-red-500" />
        </div>
        <CardTitle className="text-red-900">Annual Performance Planning Error</CardTitle>
        <CardDescription>
          Something went wrong while processing your request. This error has been logged for investigation.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="border-red-300 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-900">Error Details</AlertTitle>
          <AlertDescription className="text-red-800">
            {error.message || 'An unexpected error occurred'}
          </AlertDescription>
        </Alert>

        <div className="flex gap-3 justify-center">
          <Button
            variant="outline"
            onClick={resetErrorBoundary}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
          <Button
            onClick={() => window.location.href = '/v2/annual-performance-planning'}
            className="flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            Go to APP Home
          </Button>
        </div>

        {import.meta.env.DEV && (
          <details className="mt-4">
            <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
              Technical Details (Development)
            </summary>
            <pre className="mt-2 p-4 bg-gray-100 rounded text-xs overflow-auto max-h-40">
              {error.stack}
            </pre>
          </details>
        )}
      </CardContent>
    </Card>
  )
}

interface AppErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

interface AppErrorBoundaryProps {
  children: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

class AppErrorBoundaryClass extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  constructor(props: AppErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('APP Error Boundary:', error, errorInfo)
    this.props.onError?.(error, errorInfo)
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <AppErrorFallback
          error={this.state.error}
          resetErrorBoundary={() => this.setState({ hasError: false, error: null })}
        />
      )
    }

    return this.props.children
  }
}

export function AppErrorBoundary({ children, onError }: AppErrorBoundaryProps) {
  return (
    <AppErrorBoundaryClass onError={onError}>
      {children}
    </AppErrorBoundaryClass>
  )
}

// Step-specific error boundaries
export function Step1ErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <AppErrorBoundary
      onError={(error) => {
        console.error('APP Step 1 (Fiscal Year) Error:', error)
      }}
    >
      {children}
    </AppErrorBoundary>
  )
}

export function Step2ErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <AppErrorBoundary
      onError={(error) => {
        console.error('APP Step 2 (KPI Activation) Error:', error)
      }}
    >
      {children}
    </AppErrorBoundary>
  )
}

export function Step3ErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <AppErrorBoundary
      onError={(error) => {
        console.error('APP Step 3 (Target Distribution) Error:', error)
      }}
    >
      {children}
    </AppErrorBoundary>
  )
}

export default AppErrorBoundary