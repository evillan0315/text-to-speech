import type { ReactNode } from 'react';
import React from 'react';
import { AppBar, Toolbar, Typography, Box, Button, Stack } from '@mui/material';
import { ThemeToggle } from './ThemeToggle';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver'; // Import the chosen icon

interface LayoutProps {
  children: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isLoggedIn, logout, user } = useAuth();

  return (
    <Box
      sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}
      className="transition-colors duration-200"
    >
      <AppBar position="static" className="shadow-md">
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          {/* Left section: App Logo and Title as a Home Link */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <RouterLink to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <RecordVoiceOverIcon sx={{ fontSize: 30 }} /> {/* Adjusted size for navbar */}
                <Typography variant="h6" component="div" sx={{ color: 'inherit' }}>
                  Gemini TTS Generator
                </Typography>
              </Stack>
            </RouterLink>
          </Box>

          {/* Right section: Auth controls and Theme Toggle */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {isLoggedIn ? (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body1" sx={{ mr: 2, color: 'inherit' }}>
                  Welcome, {user?.firstName || user?.email || 'User'}
                </Typography>
                <Button onClick={logout} color="inherit" variant="outlined" sx={{ mr: 1 }}>
                  Logout
                </Button>
              </Box>
            ) : (
              <RouterLink to="/login" style={{ textDecoration: 'none' }}>
                <Button color="inherit" variant="outlined" sx={{ mr: 1 }}>
                  Login
                </Button>
              </RouterLink>
            )}
            <ThemeToggle />
          </Box>
        </Toolbar>
      </AppBar>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        {children}
      </Box>
    </Box>
  );
};
