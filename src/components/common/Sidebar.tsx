import React from 'react';
import {
  Box,
  Drawer,ListItem,ListItemButton,
  ListItemIcon,ListItemText,List
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';

import {
    Home,Person,Gavel,Storefront,
    AccountBalance,Notifications
} from '@mui/icons-material' ;

const menuItem = [
    { text: 'Home', icon: <Home />, path: '/' },
    { text: 'Users', icon: <Person />, path: '/users' },
    { text: 'Rules', icon: <Gavel />, path: '/rules' },
    { text: 'Provider', icon: <Storefront />, path: '/provider' },
    { text: 'Budget', icon: <AccountBalance />, path: '/budget' },
    { text: 'Alerts', icon: <Notifications />, path: '/alerts' },

]

const Sidebar : React.FC = () =>{

    const navigate = useNavigate();
    const location = useLocation();

    return (
        <Drawer
            variant='permanent'
            sx={{
                width:260,
                flexShrink:0,
                zIndex:1,
                [`& .MuiDrawer-paper`]:{
                    width: 260, 
                    boxSizing: 'border-box',
                    backgroundColor: 'background.paper',
                    borderRight: '1px solid',
                    borderColor: 'divider',
                    position: 'fixed',
                    height: '100vh',
                    top: 0,
                    left: 0,
                    zIndex: 1
                }
            }}
        >
        <Box sx={{ overflow:'auto',mt : 10 }}>
            <List>
                {menuItem.map((item) => (
                    <ListItem key = {item.text} disablePadding onClick={() => navigate(item.path)} sx={{ display:'block',mb:2 }}>
                        <ListItemButton
                            onClick={() => navigate(item.path)}
                            selected={location.pathname === item.path}
                            sx={{
                            minHeight: 48,
                            px: 2.5,
                            mx: 1,
                            borderRadius: 4,
                            '&:hover': { bgcolor: 'action.hover' },
                            '&.Mui-selected': { bgcolor: 'action.selected' },
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: 0, mr: 2, justifyContent: 'center' }}>
                            {item.icon}
                            </ListItemIcon>
                            <ListItemText 
                            primary={item.text} 
                            slotProps={{ primary: { fontSize: '1rem', fontWeight: 500 } }} 
                            />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Box>
        </Drawer>
    )
}

export default Sidebar