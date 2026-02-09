import React, { useState } from 'react';
import { 
  Toolbar, Typography,Box,
  Drawer,ListItem,ListItemButton,
  ListItemIcon,ListItemText,List
} from '@mui/material';

import {
    Home,Person,Gavel,Storefront,
    AccountBalance,Notifications
} from '@mui/icons-material' ;

const Sidebar : React.FC = () =>{
    const menuItem = [
        {text:'Home',icon : <Home />},
        {text:'User',icon : <Person />},
        {text:'Rules',icon : <Gavel />},
        {text:'Provider',icon : <Storefront />},
        {text:'Budget',icon : <AccountBalance />},
        {text:'Alerts',icon : <Notifications />},
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
                            sx={{
                            minHeight: 48,
                            px: 2.5,
                            mx: 1,
                            borderRadius: 4, 
                            '&:hover': { bgcolor: 'action.hover' }
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