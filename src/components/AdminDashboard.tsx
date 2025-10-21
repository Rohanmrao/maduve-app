import React, { useState } from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  AccountCircle,
  Logout,
  CheckCircle,
  Cancel,
  Visibility,
  Delete,
  Edit,
  Search as SearchIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { adminService } from '../services';
import { UserRequest, UserStatusLabels, Admin } from '../types';
import { UserManagement } from './UserManagement';
import { AdminEdit } from './AdminEdit';
import { Breadcrumbs } from './Breadcrumbs';

export const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [selectedRequest, setSelectedRequest] = useState<UserRequest | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [editAdminDialogOpen, setEditAdminDialogOpen] = useState(false);
  const [deleteAdminDialogOpen, setDeleteAdminDialogOpen] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState<Admin | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  const { data: dashboardStats = [] } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: adminService.getDashboard
  });

  const { data: pendingRequests = [], isLoading } = useQuery({
    queryKey: ['pending-requests'],
    queryFn: adminService.getPendingRequests
  });

  const { data: admins = [], isLoading: loadingAdmins } = useQuery({
    queryKey: ['admins'],
    queryFn: adminService.getAllAdmins
  });

  const approveMutation = useMutation({
    mutationFn: (requestId: string) => {
      if (!user?.id) {
        throw new Error('Admin ID is missing. Please log in again.');
      }
      console.log('Approving request with Admin ID:', user.id);
      return adminService.approveRequest(requestId, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-requests'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      setSelectedRequest(null);
    },
    onError: (err: any) => {
      console.error('Approve error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to approve request');
    }
  });

  const rejectMutation = useMutation({
    mutationFn: (requestId: string) => {
      if (!user?.id) {
        throw new Error('Admin ID is missing. Please log in again.');
      }
      console.log('Rejecting request with Admin ID:', user.id);
      return adminService.rejectRequest(requestId, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-requests'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      setSelectedRequest(null);
    },
    onError: (err: any) => {
      console.error('Reject error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to reject request');
    }
  });

  const deleteAdminMutation = useMutation({
    mutationFn: (adminId: string) => adminService.removeAdmin(adminId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      setDeleteAdminDialogOpen(false);
      setAdminToDelete(null);
    },
    onError: (err: any) => {
      setError(err.response?.data?.error || 'Failed to delete admin');
    }
  });

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
  };

  const handleViewRequest = (request: UserRequest) => {
    setSelectedRequest(request);
  };

  const handleApprove = () => {
    if (selectedRequest) {
      approveMutation.mutate(selectedRequest.id);
    }
  };

  const handleReject = () => {
    if (selectedRequest) {
      rejectMutation.mutate(selectedRequest.id);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setError('');
  };

  const handleEditAdmin = (admin: Admin) => {
    setSelectedAdmin(admin);
    setEditAdminDialogOpen(true);
  };

  const handleDeleteAdminClick = (admin: Admin) => {
    setAdminToDelete(admin);
    setDeleteAdminDialogOpen(true);
    setError('');
  };

  const handleConfirmDeleteAdmin = () => {
    if (adminToDelete) {
      deleteAdminMutation.mutate(adminToDelete.id);
    }
  };

  const filteredAdmins = admins.filter(admin =>
    admin.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Admin Dashboard
          </Typography>
          <IconButton
            color="inherit"
            onClick={handleMenuOpen}
          >
            <AccountCircle />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleLogout}>
              <Logout sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Breadcrumbs items={[{ label: 'Admin Dashboard' }]} />
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 3, mb: 4 }}>
          {dashboardStats.map((stat, index) => (
            <Card key={index}>
              <CardContent>
                <Typography variant="h6" color="primary">
                  {stat}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>

        <Card>
          <CardContent>
            <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
              <Tab label="Pending Requests" />
              <Tab label="User Management" />
              <Tab label="Admin Management" />
            </Tabs>

            {tabValue === 0 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Pending User Requests
                </Typography>

            {isLoading ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Phone</TableCell>
                      <TableCell>Ecclesia</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pendingRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>{request.fullName}</TableCell>
                        <TableCell>{request.email}</TableCell>
                        <TableCell>{request.phone}</TableCell>
                        <TableCell>{request.ecclesia}</TableCell>
                        <TableCell>
                          <Chip 
                            label={UserStatusLabels[request.status]} 
                            color="warning"
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            startIcon={<Visibility />}
                            onClick={() => handleViewRequest(request)}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {pendingRequests.length === 0 && !isLoading && (
              <Typography variant="body1" color="textSecondary" align="center" sx={{ py: 4 }}>
                No pending requests.
              </Typography>
            )}
              </Box>
            )}

            {tabValue === 1 && (
              <Box>
                <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                  User Management
                </Typography>
                <UserManagement adminId={user?.id || ''} />
              </Box>
            )}

            {tabValue === 2 && (
              <Box>
                <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                  Admin Management
                </Typography>

                <Box sx={{ mb: 3 }}>
                  <TextField
                    fullWidth
                    placeholder="Search admins by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>

                {loadingAdmins ? (
                  <Box display="flex" justifyContent="center" p={3}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Name</TableCell>
                          <TableCell>Email</TableCell>
                          <TableCell>Phone</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredAdmins.map((admin) => (
                          <TableRow key={admin.id}>
                            <TableCell>{admin.fullName}</TableCell>
                            <TableCell>{admin.email}</TableCell>
                            <TableCell>{admin.phone}</TableCell>
                            <TableCell>
                              <Chip 
                                label={admin.isActive ? 'Active' : 'Inactive'} 
                                color={admin.isActive ? 'success' : 'default'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Button
                                size="small"
                                startIcon={<Edit />}
                                onClick={() => handleEditAdmin(admin)}
                                sx={{ mr: 1 }}
                              >
                                Edit
                              </Button>
                              <Button
                                size="small"
                                color="error"
                                startIcon={<Delete />}
                                onClick={() => handleDeleteAdminClick(admin)}
                              >
                                Delete
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}

                {filteredAdmins.length === 0 && !loadingAdmins && (
                  <Typography variant="body1" color="textSecondary" align="center" sx={{ py: 4 }}>
                    No admins found.
                  </Typography>
                )}
              </Box>
            )}
          </CardContent>
        </Card>
      </Container>

      <Dialog
        open={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
        maxWidth="md"
        fullWidth
      >
        {selectedRequest && (
          <>
            <DialogTitle>User Request Details</DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
                <Box>
                  <Typography variant="subtitle1" color="textSecondary">
                    Full Name
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedRequest.fullName}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle1" color="textSecondary">
                    Email
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedRequest.email}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle1" color="textSecondary">
                    Phone
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedRequest.phone}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle1" color="textSecondary">
                    Ecclesia
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedRequest.ecclesia}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle1" color="textSecondary">
                    Language
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedRequest.language}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle1" color="textSecondary">
                    Education
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedRequest.education}
                  </Typography>
                </Box>
                <Box sx={{ gridColumn: '1 / -1' }}>
                  <Typography variant="subtitle1" color="textSecondary">
                    Bio
                  </Typography>
                  <Typography variant="body1">
                    {selectedRequest.bio}
                  </Typography>
                </Box>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedRequest(null)}>Cancel</Button>
              <Button
                onClick={handleReject}
                variant="outlined"
                color="error"
                startIcon={<Cancel />}
                disabled={rejectMutation.isPending}
              >
                Reject
              </Button>
              <Button
                onClick={handleApprove}
                variant="contained"
                color="success"
                startIcon={<CheckCircle />}
                disabled={approveMutation.isPending}
              >
                Approve
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <AdminEdit
        open={editAdminDialogOpen}
        onClose={() => {
          setEditAdminDialogOpen(false);
          setSelectedAdmin(null);
        }}
        admin={selectedAdmin}
      />

      <Dialog open={deleteAdminDialogOpen} onClose={() => setDeleteAdminDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete admin <strong>{adminToDelete?.fullName}</strong>?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteAdminDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleConfirmDeleteAdmin}
            color="error"
            variant="contained"
            disabled={deleteAdminMutation.isPending}
          >
            {deleteAdminMutation.isPending ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
