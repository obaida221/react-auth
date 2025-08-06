import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Button, 
  Box, 
  Typography, 
  IconButton,
  Menu,
  MenuItem
} from '@mui/material';
import { 
  AccountCircle, 
  Logout, 
  DarkMode, 
  LightMode 
} from '@mui/icons-material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import darkModeLogo from '../assets/dark mode wolf.png';
import lightModeLogo from '../assets/light mode wolf.png';

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated, canManageProducts } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleMenuClose();
  };

  const isMenuOpen = Boolean(anchorEl);

  const isLoggedIn = isAuthenticated();
  const isLoginPage = location.pathname === '/login';
  const isRegisterPage = location.pathname === '/register';

  const navItems = isLoggedIn ? [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Products', path: '/products' },
  ] : [];

  return (
    <AppBar position="static">
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
          <img 
            src={darkMode ? lightModeLogo : darkModeLogo} 
            alt="Logo" 
            style={{ 
              height: '40px', 
              width: 'auto', 
              marginRight: '8px' 
            }} 
          />
          <Typography variant="h6" component="div">
            Auth App
          </Typography>
        </Box>
        
        <Box sx={{ flexGrow: 1, display: 'flex', gap: 2 }}>
          {navItems.map((item) => (
            <Button
              key={item.path}
              component={Link}
              to={item.path}
              variant={location.pathname === item.path ? 'outlined' : 'text'}
              color="inherit"
              align="right"
              sx={{ textTransform: 'none' }}
            >
              {item.label}
            </Button>
          ))}
        </Box>

        <IconButton
          color="inherit"
          onClick={toggleDarkMode}
          sx={{ mr: 1 }}
        >
          {darkMode ? <LightMode /> : <DarkMode />}
        </IconButton>

        {!isLoggedIn && !isLoginPage && !isRegisterPage && (
          <>
            <Button
              component={Link}
              to="/login"
              color="inherit"
              sx={{ mr: 1 }}
            >
              Login
            </Button>
            <Button
              component={Link}
              to="/register"
              color="inherit"
              variant="outlined"
            >
              Register
            </Button>
          </>
        )}

        {!isLoggedIn && isLoginPage && (
          <Button
            component={Link}
            to="/register"
            color="inherit"
            variant="outlined"
          >
            Register
          </Button>
        )}

        {!isLoggedIn && isRegisterPage && (
          <Button
            component={Link}
            to="/login"
            color="inherit"
            variant="outlined"
          >
            Login
          </Button>
        )}

        {isLoggedIn && (
          <>
            <IconButton
              color="inherit"
              onClick={handleProfileMenuOpen}
              aria-controls="profile-menu"
              aria-haspopup="true"
            >
              <AccountCircle />
            </IconButton>
            
            <Menu
              id="profile-menu"
              anchorEl={anchorEl}
              open={isMenuOpen}
              onClose={handleMenuClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              <MenuItem disabled>
                <Typography variant="body2" color="text.secondary">
                  {user?.name}
                </Typography>
              </MenuItem>
              <MenuItem disabled>
                <Typography variant="body2" color="text.secondary">
                  {user?.email}
                </Typography>
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <Logout sx={{ mr: 1 }} />
                Logout
              </MenuItem>
            </Menu>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navigation;
