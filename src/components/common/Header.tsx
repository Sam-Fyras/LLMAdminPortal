import React, { useState } from 'react';
import {
  AppBar, Toolbar, Typography, Box, Avatar,
  Container, Menu, MenuItem, ListItemIcon,
  ListItemText, Divider, Chip, Tooltip, IconButton,
} from '@mui/material';
import {
  SwapHoriz as SwitchIcon,
  CheckCircle as ActiveIcon,
  AdminPanelSettings as SuperAdminIcon,
  ManageAccounts as AdminIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { mockTenantUsers, MockTenantUser } from '../../mocks/data/mockUsers';

const ROLE_CONFIG = {
  super_admin: {
    label: 'Super Admin',
    color: 'warning' as const,
    icon: <SuperAdminIcon fontSize="small" />,
  },
  admin: {
    label: 'Admin',
    color: 'primary' as const,
    icon: <AdminIcon fontSize="small" />,
  },
};

const Header: React.FC = () => {
  const { isAuthenticated, account, currentMockUser, switchUser } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleSwitchUser = (user: MockTenantUser) => {
    switchUser(user);
    setAnchorEl(null);
    navigate(user.role === 'super_admin' ? '/tenants' : '/users');
  };

  const roleConfig = ROLE_CONFIG[currentMockUser.role];

  return (
    <AppBar position="fixed" sx={{ zIndex: 2 }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', fontWeight: 700 }}
          >
            Fyras LLM Admin Portal
          </Typography>

          {isAuthenticated && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              {/* Current user info */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar sx={{ width: 34, height: 34, bgcolor: 'secondary.main', fontSize: 15, fontWeight: 700 }}>
                  {account?.name?.charAt(0)?.toUpperCase() || 'U'}
                </Avatar>
                <Box sx={{ lineHeight: 1 }}>
                  <Typography variant="body2" sx={{ color: 'white', fontWeight: 600, lineHeight: 1.2 }}>
                    {account?.name || 'User'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.65)', lineHeight: 1.2 }}>
                    {account?.username || ''}
                  </Typography>
                </Box>
                <Chip
                  label={roleConfig.label}
                  size="small"
                  color={roleConfig.color}
                  icon={roleConfig.icon}
                  sx={{ height: 22, fontSize: 11, fontWeight: 600, ml: 0.5 }}
                />
              </Box>

              <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.25)' }} />

              {/* Switch User button */}
              <Tooltip title="Switch user">
                <IconButton
                  size="small"
                  onClick={(e) => setAnchorEl(e.currentTarget)}
                  sx={{
                    color: 'rgba(255,255,255,0.85)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    borderRadius: 2,
                    px: 1.5,
                    py: 0.5,
                    gap: 0.5,
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.12)', color: 'white' },
                  }}
                >
                  <SwitchIcon fontSize="small" />
                  <Typography variant="caption" sx={{ fontWeight: 500 }}>
                    Switch User
                  </Typography>
                </IconButton>
              </Tooltip>

              {/* Switch User dropdown */}
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                slotProps={{
                  paper: { elevation: 4, sx: { minWidth: 230, borderRadius: 2, mt: 0.5 } },
                }}
              >
                <Box sx={{ px: 2, py: 1 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
                    Switch Account
                  </Typography>
                </Box>
                <Divider />
                {mockTenantUsers.map((user) => {
                  const cfg = ROLE_CONFIG[user.role];
                  const isActive = user.id === currentMockUser.id;
                  return (
                    <MenuItem
                      key={user.id}
                      onClick={() => handleSwitchUser(user)}
                      selected={isActive}
                      sx={{ py: 1.25, gap: 1.5 }}
                    >
                      <Avatar sx={{ width: 32, height: 32, bgcolor: isActive ? 'primary.main' : 'grey.400', fontSize: 14, fontWeight: 700 }}>
                        {user.name.charAt(0).toUpperCase()}
                      </Avatar>
                      <ListItemText
                        primary={user.name}
                        secondary={user.username}
                        slotProps={{
                          primary: { fontWeight: isActive ? 700 : 400 },
                          secondary: { style: { fontSize: 11 } },
                        }}
                      />
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                        <Chip label={cfg.label} size="small" color={cfg.color} sx={{ height: 20, fontSize: 10, fontWeight: 600 }} />
                        {isActive && <ActiveIcon fontSize="small" color="success" />}
                      </Box>
                    </MenuItem>
                  );
                })}
              </Menu>
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;
