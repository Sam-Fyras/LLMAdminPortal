import React, { useState, useEffect } from 'react';
import { 
  Container, Box, Typography, Button, 
  Paper, CircularProgress, Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage: React.FC = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);
  
  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await login();
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to login');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center' 
            }}
          >
            <Typography component="h1" variant="h4" gutterBottom>
              Fyras LLM Admin Portal
            </Typography>
            
            <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 3 }}>
              Manage LLM rules, token usage, and user roles for your organization
            </Typography>
            
            {error && (
              <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
                {error}
              </Alert>
            )}
            
            <Button
              variant="contained"
              size="large"
              disabled={loading}
              onClick={handleLogin}
              sx={{ mt: 2 }}
              fullWidth
            >
              {loading ? <CircularProgress size={24} /> : 'Sign in with Microsoft'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginPage;
