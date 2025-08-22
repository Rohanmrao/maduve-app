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
  CircularProgress
} from '@mui/material';
import {
  AccountCircle,
  Logout,
  CheckCircle,
  Cancel,
  Visibility
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { adminService } from '../services';
import { UserRequest, UserStatusLabels } from '../types';

export const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [selectedRequest, setSelectedRequest] = useState<UserRequest | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  const { data: dashboardResponse } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: adminService.getDashboard
  });

  const dashboardStats = dashboardResponse?.stats || [];

  const { data: pendingRequests = [], isLoading } = useQuery({
    queryKey: ['pending-requests'],
    queryFn: adminService.getPendingRequests
  });

  const approveMutation = useMutation({
    mutationFn: (requestId: string) => adminService.approveRequest(requestId, user?.id || ''),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-requests'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      setSelectedRequest(null);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to approve request');
    }
  });

  const rejectMutation = useMutation({
    mutationFn: (requestId: string) => adminService.rejectRequest(requestId, user?.id || ''),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-requests'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      setSelectedRequest(null);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to reject request');
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
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
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
    </Box>
  );
};
