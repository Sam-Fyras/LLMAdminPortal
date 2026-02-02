import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button, Paper, Container } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

/**
 * ErrorBoundary props
 */
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode; // Custom fallback UI
  onError?: (error: Error, errorInfo: ErrorInfo) => void; // Error callback
}

/**
 * ErrorBoundary state
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary component
 * Catches JavaScript errors anywhere in the child component tree
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Update state with error details
    this.setState({
      error,
      errorInfo,
    });

    // Call optional error callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // In production, you might want to send this to an error tracking service
    // e.g., Sentry, LogRocket, etc.
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <Container maxWidth="md">
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '100vh',
              py: 4,
            }}
          >
            <Paper
              elevation={3}
              sx={{
                p: 4,
                textAlign: 'center',
                maxWidth: 600,
              }}
            >
              <ErrorOutlineIcon
                sx={{
                  fontSize: 80,
                  color: 'error.main',
                  mb: 2,
                }}
              />

              <Typography variant="h4" gutterBottom>
                Something went wrong
              </Typography>

              <Typography variant="body1" color="text.secondary" paragraph>
                We're sorry, but something unexpected happened. Please try
                refreshing the page or contact support if the problem persists.
              </Typography>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <Box
                  sx={{
                    mt: 3,
                    p: 2,
                    bgcolor: 'grey.100',
                    borderRadius: 1,
                    textAlign: 'left',
                    overflow: 'auto',
                  }}
                >
                  <Typography
                    variant="caption"
                    component="pre"
                    sx={{
                      fontFamily: 'monospace',
                      fontSize: '0.75rem',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    }}
                  >
                    <strong>Error:</strong> {this.state.error.toString()}
                    {'\n\n'}
                    <strong>Stack:</strong>
                    {'\n'}
                    {this.state.errorInfo?.componentStack}
                  </Typography>
                </Box>
              )}

              <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  onClick={this.handleReset}
                  color="primary"
                >
                  Try Again
                </Button>

                <Button
                  variant="outlined"
                  onClick={() => window.location.reload()}
                  color="primary"
                >
                  Refresh Page
                </Button>
              </Box>
            </Paper>
          </Box>
        </Container>
      );
    }

    return this.props.children;
  }
}

/**
 * Usage example:
 *
 * // Wrap your app or specific components
 * function App() {
 *   return (
 *     <ErrorBoundary
 *       onError={(error, errorInfo) => {
 *         // Send to error tracking service
 *         console.error('App error:', error);
 *       }}
 *     >
 *       <YourApp />
 *     </ErrorBoundary>
 *   );
 * }
 *
 * // With custom fallback
 * <ErrorBoundary
 *   fallback={
 *     <Box p={4}>
 *       <Typography>Custom error message</Typography>
 *     </Box>
 *   }
 * >
 *   <ComponentThatMightError />
 * </ErrorBoundary>
 */
