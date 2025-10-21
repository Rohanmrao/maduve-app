import React, { useState } from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  AccountCircle,
  Logout,
  CheckCircle,
  Cancel,
  ArrowBack
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { connectService } from '../services';
import { ConnectRequestStatusLabels } from '../types';
import { Breadcrumbs } from './Breadcrumbs';

export const ConnectionsPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: receivedRequests = [], isLoading: loadingReceived } = useQuery({
    queryKey: ['received-requests', user?.id],
    queryFn: () => connectService.getPendingRequests(user?.id || ''),
    enabled: !!user?.id
  });

  const { data: sentRequests = [], isLoading: loadingSent } = useQuery({
    queryKey: ['sent-requests', user?.id],
    queryFn: () => connectService.getSentRequests(user?.id || ''),
    enabled: !!user?.id
  });

  const acceptMutation = useMutation({
    mutationFn: (senderId: string) => connectService.acceptConnectRequest(user?.id || '', senderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['received-requests'] });
      queryClient.invalidateQueries({ queryKey: ['sent-requests'] });
    },
    onError: (err: any) => {
      setError(err.response?.data?.error || 'Failed to accept request');
    }
  });

  const rejectMutation = useMutation({
    mutationFn: (senderId: string) => connectService.rejectConnectRequest(user?.id || '', senderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['received-requests'] });
      queryClient.invalidateQueries({ queryKey: ['sent-requests'] });
    },
    onError: (err: any) => {
      setError(err.response?.data?.error || 'Failed to reject request');
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

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setError('');
  };

  const handleAccept = (senderId: string) => {
    acceptMutation.mutate(senderId);
  };

  const handleReject = (senderId: string) => {
    rejectMutation.mutate(senderId);
  };

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            color="inherit"
            onClick={() => navigate('/dashboard')}
            sx={{ mr: 2 }}
          >
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Connection Requests
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
        <Breadcrumbs items={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Connections' }]} />
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Card>
          <CardContent>
            <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
              <Tab label={`Received Requests (${receivedRequests.length})`} />
              <Tab label={`Sent Requests (${sentRequests.length})`} />
            </Tabs>

            {tabValue === 0 && (
              <Box>
                {loadingReceived ? (
                  <Box display="flex" justifyContent="center" p={3}>
                    <CircularProgress />
                  </Box>
                ) : receivedRequests.length === 0 ? (
                  <Typography variant="body1" color="textSecondary" align="center" sx={{ py: 4 }}>
                    No received connection requests.
                  </Typography>
                ) : (
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>From</TableCell>
                          <TableCell>Message</TableCell>
                          <TableCell>Date</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {receivedRequests.map((request) => (
                          <TableRow key={request.id}>
                            <TableCell>
                              <Box display="flex" alignItems="center">
                                <Avatar sx={{ mr: 2 }}>
                                  {request.senderName.charAt(0)}
                                </Avatar>
                                <Typography>{request.senderName}</Typography>
                              </Box>
                            </TableCell>
                            <TableCell>{request.message}</TableCell>
                            <TableCell>
                              {new Date(request.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={ConnectRequestStatusLabels[request.status]} 
                                color={request.status === 0 ? 'warning' : request.status === 1 ? 'success' : 'error'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              {request.status === 0 && (
                                <Box display="flex" gap={1}>
                                  <Button
                                    size="small"
                                    variant="contained"
                                    color="success"
                                    startIcon={<CheckCircle />}
                                    onClick={() => handleAccept(request.senderId)}
                                    disabled={acceptMutation.isPending || rejectMutation.isPending}
                                  >
                                    Accept
                                  </Button>
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    color="error"
                                    startIcon={<Cancel />}
                                    onClick={() => handleReject(request.senderId)}
                                    disabled={acceptMutation.isPending || rejectMutation.isPending}
                                  >
                                    Reject
                                  </Button>
                                </Box>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>
            )}

            {tabValue === 1 && (
              <Box>
                {loadingSent ? (
                  <Box display="flex" justifyContent="center" p={3}>
                    <CircularProgress />
                  </Box>
                ) : sentRequests.length === 0 ? (
                  <Typography variant="body1" color="textSecondary" align="center" sx={{ py: 4 }}>
                    No sent connection requests.
                  </Typography>
                ) : (
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>To</TableCell>
                          <TableCell>Message</TableCell>
                          <TableCell>Date</TableCell>
                          <TableCell>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {sentRequests.map((request) => (
                          <TableRow key={request.id}>
                            <TableCell>
                              <Box display="flex" alignItems="center">
                                <Avatar sx={{ mr: 2 }}>
                                  {request.receiverName.charAt(0)}
                                </Avatar>
                                <Typography>{request.receiverName}</Typography>
                              </Box>
                            </TableCell>
                            <TableCell>{request.message}</TableCell>
                            <TableCell>
                              {new Date(request.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={ConnectRequestStatusLabels[request.status]} 
                                color={request.status === 0 ? 'warning' : request.status === 1 ? 'success' : 'error'}
                                size="small"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

