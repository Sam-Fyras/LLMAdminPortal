import React from 'react';
import { Container, Box, Typography } from '@mui/material';
import Header from './Header';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh'}}>
      <Header />
      <Box sx={{display:'flex',flex:1,overflow:'hidden'}}>
        <Sidebar />
        <Container component="main" sx={{ mt: 10, mb: 4,flexGrow: 1, overflow:'auto'}}>
          {children}
        </Container>
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
