import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CircularProgress, Box, Typography, Paper } from '@mui/material';
import Navigation from './Navigation';

const RoleProtectedRoute = ({ children, requiredRole, requireManageProducts = false }) => {
  const { isAuthenticated, loading, hasRole, canManageProducts, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check specific role requirement
  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <>
        <Navigation />
        <Box 
          display="flex" 
          justifyContent="center" 
          alignItems="center" 
          minHeight="50vh"
          p={3}
        >
          <Paper elevation={3} sx={{ p: 4, textAlign: 'center', maxWidth: 500 }}>
            <Typography variant="h5" color="error" gutterBottom>
              Access Denied
            </Typography>
            <Typography variant="body1" color="text.secondary">
              You don't have permission to access this page. 
              Required role: {requiredRole}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Your current role: {user?.role || 'None'}
            </Typography>
          </Paper>
        </Box>
      </>
    );
  }

  // Check product management permission
  if (requireManageProducts && !canManageProducts()) {
    return (
      <>
        <Navigation />
        <Box 
          display="flex" 
          justifyContent="center" 
          alignItems="center" 
          minHeight="50vh"
          p={3}
        >
          <Paper elevation={3} sx={{ p: 4, textAlign: 'center', maxWidth: 500 }}>
            <Typography variant="h5" color="error" gutterBottom>
              Access Denied
            </Typography>
            <Typography variant="body1" color="text.secondary">
              You don't have permission to manage products. 
              This feature is only available to Super Admins and Admins.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Your current role: {user?.role || 'None'}
            </Typography>
          </Paper>
        </Box>
      </>
    );
  }

  return children;
};

export default RoleProtectedRoute;
