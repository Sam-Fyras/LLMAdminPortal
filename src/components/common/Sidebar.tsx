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

const Sidebar : React.FC = () =>{
    const navigate = useNavigate();
    const location = useLocation();

    const menuItem = [
        {text:'Home', icon : <Home />, path: '/dashboard'},
        {text:'User', icon : <Person />, path: '/users'},
        {text:'Rules', icon : <Gavel />, path: '/rules'},
        {text:'Provider', icon : <Storefront />, path: '/providers'},
        {text:'Budget', icon : <AccountBalance />, path: '/budget'},
        {text:'Alerts', icon : <Notifications />, path: '/alerts'},
    ]

    return (
        <Drawer
            variant='permanent'
            sx={{
                flexShrink:0,
                zIndex:1,
                [`& .MuiDrawer-paper`]:{
                    width: 260, 
                    boxSizing: 'border-box',
                    backgroundColor: 'background.paper',
                    borderRight: '1px solid',
                    borderColor: 'divider'
                }
            }}
        >
        <Box sx={{ overflow:'auto',mt : 10 }}>
            <List>
                {menuItem.map((item) => (
                    <ListItem key = {item.text} disablePadding sx={{ display:'block',mb:2 }}>
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