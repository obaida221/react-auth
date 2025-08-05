import React, { useState, useEffect } from 'react';
import Navigation from './Navigation';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Alert,
  Snackbar,
  Chip,
  Fab,
  Tooltip,
  CircularProgress,
  Container,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { productsAPI } from '../services/api';

const Products = () => {
  const { canManageProducts, user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('view'); // 'view', 'create', 'edit'
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getProducts();
      if (response.data && response.data.data) {
        // Handle both paginated and non-paginated responses
        const productData = Array.isArray(response.data.data) 
          ? response.data.data 
          : response.data.data.data || [];
        setProducts(productData);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      showSnackbar('Error fetching products', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleOpenDialog = (mode, product = null) => {
    setDialogMode(mode);
    setSelectedProduct(product);
    
    if (mode === 'create') {
      setFormData({
        name: '',
        price: '',
        description: ''
      });
    } else if (product) {
      setFormData({
        name: product.name || '',
        price: product.price || '',
        description: product.description || ''
      });
    }
    
    setErrors({});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedProduct(null);
    setFormData({
      name: '',
      price: '',
      description: ''
    });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }

    if (!formData.price || isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Valid price is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Product description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleCreateProduct = async () => {
    if (!validateForm()) return;

    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price)
      };

      const response = await productsAPI.createProduct(productData);
      
      if (response.data && response.data.data) {
        setProducts(prev => [...prev, response.data.data]);
        showSnackbar('Product created successfully');
        handleCloseDialog();
      }
    } catch (error) {
      console.error('Error creating product:', error);
      const errorMessage = error.response?.data?.message || 'Error creating product';
      showSnackbar(errorMessage, 'error');
    }
  };

  const handleUpdateProduct = async () => {
    if (!validateForm() || !selectedProduct) return;

    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price)
      };

      const response = await productsAPI.updateProduct(selectedProduct.id, productData);
      
      if (response.data && response.data.data) {
        setProducts(prev => 
          prev.map(product => 
            product.id === selectedProduct.id ? response.data.data : product
          )
        );
        showSnackbar('Product updated successfully');
        handleCloseDialog();
      }
    } catch (error) {
      console.error('Error updating product:', error);
      const errorMessage = error.response?.data?.message || 'Error updating product';
      showSnackbar(errorMessage, 'error');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      await productsAPI.deleteProduct(productId);
      setProducts(prev => prev.filter(product => product.id !== productId));
      showSnackbar('Product deleted successfully');
    } catch (error) {
      console.error('Error deleting product:', error);
      const errorMessage = error.response?.data?.message || 'Error deleting product';
      showSnackbar(errorMessage, 'error');
    }
  };

  const getDialogTitle = () => {
    switch (dialogMode) {
      case 'create':
        return 'Create New Product';
      case 'edit':
        return 'Edit Product';
      case 'view':
        return 'Product Details';
      default:
        return 'Product';
    }
  };

  const getUserRoleChip = () => {
    if (!user?.role) return null;
    
    const roleColors = {
      'super_admin': 'error',
      'admin': 'warning',
      'user': 'default'
    };

    return (
      <Chip
        label={user.role.replace('_', ' ').toUpperCase()}
        color={roleColors[user.role] || 'default'}
        size="small"
      />
    );
  };

  if (loading) {
    return (
      <>
        <Navigation />
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Box 
            display="flex" 
            justifyContent="center" 
            alignItems="center" 
            minHeight="400px"
          >
            <CircularProgress />
          </Box>
        </Container>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Header */}
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 3 
          }}
        >
          <Box>
            <Typography variant="h4" gutterBottom>
              {canManageProducts() ? 'Products Management' : 'Products'}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" color="text.secondary">
                {canManageProducts() 
                  ? `Welcome, ${user?.name}` 
                  : 'Browse our collection of products'
                }
              </Typography>
              {getUserRoleChip()}
            </Box>
          </Box>
        </Box>

        {canManageProducts() ? (
          <TableContainer component={Paper} elevation={2}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography variant="body2" color="text.secondary">
                        No products found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product) => (
                    <TableRow key={product.id} hover>
                      <TableCell>{product.id}</TableCell>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>${parseFloat(product.price || 0).toFixed(2)}</TableCell>
                      <TableCell>
                        {product.description?.length > 50 
                          ? `${product.description.substring(0, 50)}...` 
                          : product.description}
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleOpenDialog('view', product)}
                            >
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          
                          <Tooltip title="Edit Product">
                            <IconButton
                              size="small"
                              color="secondary"
                              onClick={() => handleOpenDialog('edit', product)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          
                          <Tooltip title="Delete Product">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteProduct(product.id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 3 }}>
            {products.length === 0 ? (
              <Paper elevation={1} sx={{ p: 4, textAlign: 'center', gridColumn: '1 / -1' }}>
                <Typography variant="h6" color="text.secondary">
                  No products available
                </Typography>
              </Paper>
            ) : (
              products.map((product) => (
                <Paper key={product.id} elevation={3} sx={{ p: 3, display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="h6" gutterBottom>
                    {product.name}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1, mb: 2 }}>
                    {product.description}
                  </Typography>

                  <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" color="primary">
                      ${parseFloat(product.price || 0).toFixed(2)}
                    </Typography>
                    <Button 
                      variant="outlined" 
                      size="small"
                      onClick={() => handleOpenDialog('view', product)}
                    >
                      View Details
                    </Button>
                  </Box>
                </Paper>
              ))
            )}
          </Box>
        )}

        {canManageProducts() && (
          <Tooltip title="Add New Product">
            <Fab
              color="primary"
              aria-label="add product"
              sx={{
                position: 'fixed',
                bottom: 16,
                right: 16,
              }}
              onClick={() => handleOpenDialog('create')}
            >
              <AddIcon />
            </Fab>
          </Tooltip>
        )}

        <Dialog 
          open={openDialog} 
          onClose={handleCloseDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>{getDialogTitle()}</DialogTitle>
          
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <TextField
                label="Product Name"
                fullWidth
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                error={!!errors.name}
                helperText={errors.name}
                disabled={dialogMode === 'view'}
              />
              
              <TextField
                label="Price"
                type="number"
                fullWidth
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                error={!!errors.price}
                helperText={errors.price}
                disabled={dialogMode === 'view'}
                InputProps={{
                  startAdornment: <Typography>$</Typography>,
                }}
              />
              
              <TextField
                label="Description"
                multiline
                rows={4}
                fullWidth
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                error={!!errors.description}
                helperText={errors.description}
                disabled={dialogMode === 'view'}
              />
            </Box>
          </DialogContent>

          <DialogActions>
            <Button onClick={handleCloseDialog}>
              {dialogMode === 'view' ? 'Close' : 'Cancel'}
            </Button>
            
            {dialogMode === 'create' && canManageProducts() && (
              <Button 
                onClick={handleCreateProduct}
                variant="contained"
                color="primary"
              >
                Create Product
              </Button>
            )}
            
            {dialogMode === 'edit' && canManageProducts() && (
              <Button 
                onClick={handleUpdateProduct}
                variant="contained"
                color="primary"
              >
                Update Product
              </Button>
            )}
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </>
  );
};

export default Products;


