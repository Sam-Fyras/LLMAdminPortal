import React from 'react';
import { Container, Box, Typography } from '@mui/material';
import Header from './Header';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', overflow: 'hidden'}}>
      <Header />
      <Box sx={{display:'flex', flex:1, overflow:'hidden', width: '100%' }}>
        <Sidebar />
        <Box
          component="main"
          sx={{
            mt: '80px', // Top margin to clear fixed header (64px toolbar + 16px padding)
            pt: 3, // Additional padding for breathing room
            mb: 4,
            ml: '260px', // Add left margin equal to sidebar width
            flex: 1,
            overflow:'auto',
            display:'flex',
            width: 'calc(100% - 260px)' // Ensure content doesn't overlap
          }}
        >
          <Container maxWidth="xl" sx={{ flex: 1 }}>
            {children}
          </Container>
        </Box>
      </Box>
      <Box component="footer" sx={{ py: 3, bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Box textAlign="center">
            <Typography variant="body2" color="text.secondary">
              © {new Date().getFullYear()} Fyras Solutions Inc. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;
