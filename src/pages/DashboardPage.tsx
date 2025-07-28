import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Card, CardContent, 
  CircularProgress, Select, MenuItem, FormControl, 
  InputLabel, SelectChangeEvent, Alert
} from '@mui/material';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { fetchTokenUsage, fetchModelUsage } from '../api/tokens';
import { TokenUsageSummary, ModelUsage } from '../types';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const DashboardPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState<string>('7d');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [tokenUsage, setTokenUsage] = useState<TokenUsageSummary | null>(null);
  const [modelUsage, setModelUsage] = useState<ModelUsage[]>([]);
  
  const handleTimeRangeChange = (event: SelectChangeEvent) => {
    setTimeRange(event.target.value);
  };
  
  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const [tokenResponse, modelResponse] = await Promise.all([
          fetchTokenUsage(timeRange),
          fetchModelUsage(timeRange)
        ]);
        
        setTokenUsage(tokenResponse.data);
        setModelUsage(modelResponse.data);
      } catch (err) {
        setError('Failed to load dashboard data. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    loadDashboardData();
  }, [timeRange]);
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4, alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Token Usage Dashboard
        </Typography>
        
        <FormControl sx={{ width: 200 }}>
          <InputLabel id="time-range-label">Time Range</InputLabel>
          <Select
            labelId="time-range-label"
            value={timeRange}
            label="Time Range"
            onChange={handleTimeRangeChange}
          >
            <MenuItem value="24h">Last 24 Hours</MenuItem>
            <MenuItem value="7d">Last 7 Days</MenuItem>
            <MenuItem value="30d">Last 30 Days</MenuItem>
            <MenuItem value="90d">Last 90 Days</MenuItem>
          </Select>
        </FormControl>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
        <Card sx={{ flex: '1 1 200px', minWidth: '200px' }}>
          <CardContent>
            <Typography color="text.secondary" gutterBottom>
              Total Tokens Used
            </Typography>
            <Typography variant="h4">
              {tokenUsage?.totalTokens?.toLocaleString() || '0'}
            </Typography>
          </CardContent>
        </Card>
        
        <Card sx={{ flex: '1 1 200px', minWidth: '200px' }}>
          <CardContent>
            <Typography color="text.secondary" gutterBottom>
              Active Users
            </Typography>
            <Typography variant="h4">
              {tokenUsage?.activeUsers || '0'}
            </Typography>
          </CardContent>
        </Card>
        
        <Card sx={{ flex: '1 1 200px', minWidth: '200px' }}>
          <CardContent>
            <Typography color="text.secondary" gutterBottom>
              Estimated Cost
            </Typography>
            <Typography variant="h4">
              ${tokenUsage?.estimatedCost?.toFixed(2) || '0.00'}
            </Typography>
          </CardContent>
        </Card>
        
        <Card sx={{ flex: '1 1 200px', minWidth: '200px' }}>
          <CardContent>
            <Typography color="text.secondary" gutterBottom>
              Avg Tokens per Request
            </Typography>
            <Typography variant="h4">
              {tokenUsage?.avgTokensPerRequest?.toLocaleString() || '0'}
            </Typography>
          </CardContent>
        </Card>
      </Box>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        <Card sx={{ flex: '3 1 600px', minWidth: '300px' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Daily Token Usage
            </Typography>
            
            <Box sx={{ height: 300 }}>
              {tokenUsage?.dailyUsage && tokenUsage.dailyUsage.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={tokenUsage.dailyUsage}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="promptTokens" 
                      name="Prompt Tokens" 
                      stroke="#8884d8" 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="completionTokens" 
                      name="Completion Tokens" 
                      stroke="#82ca9d" 
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  height: '100%'
                }}>
                  <Typography color="text.secondary">
                    No usage data available for the selected time range
                  </Typography>
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>
        
        <Card sx={{ flex: '1 1 300px', minWidth: '300px' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Model Usage Distribution
            </Typography>
            
            <Box sx={{ height: 300 }}>
              {modelUsage && modelUsage.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={modelUsage}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      dataKey="value"
                      nameKey="model"
                      label={({name, percent}) => `${name}: ${(percent ? (percent * 100).toFixed(0) : 0)}%`}
                    >
                      {modelUsage.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  height: '100%'
                }}>
                  <Typography color="text.secondary">
                    No model usage data available
                  </Typography>
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default DashboardPage;
