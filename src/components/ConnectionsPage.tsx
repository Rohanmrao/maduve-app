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
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  AccountCircle,
  Logout,
  CheckCircle,
  Cancel,
  ArrowBack,
  Visibility
} from '@mui/icons-material';
import { ImageList, ImageListItem } from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { connectService, userService } from '../services';
import { ConnectRequesttatusLabels } from '../types';
import { Breadcrumbs } from './Breadcrumbs';

export const ConnectionsPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [error, setError] = useState('');
  const [selectedSenderId, setSelectedSenderId] = useState<string | null>(null);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
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

  const { data: senderProfile, isLoading: loadingProfile } = useQuery({
    queryKey: ['sender-profile', selectedSenderId],
    queryFn: () => userService.getUserById(selectedSenderId || ''),
    enabled: !!selectedSenderId
  });

  const { data: senderProfileImages, isLoading: loadingProfileImages } = useQuery({
    queryKey: ['sender-profile-images', selectedSenderId],
    queryFn: () => userService.getAllProfileImages(selectedSenderId || ''),
    enabled: !!selectedSenderId
  });

  const acceptMutation = useMutation({
    mutationFn: (senderId: string) => connectService.acceptConnectRequest(user?.id || '', senderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['received-requests'] });
      queryClient.invalidateQueries({ queryKey: ['sent-requests'] });
      setError(''); // Clear any previous errors
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
      setError(''); // Clear any previous errors
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

  const handleViewProfile = (senderId: string) => {
    setSelectedSenderId(senderId);
    setProfileDialogOpen(true);
  };

  const handleCloseProfileDialog = () => {
    setProfileDialogOpen(false);
    setSelectedSenderId(null);
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
                  <TableContainer component={Paper} sx={{ maxWidth: '100%', overflowX: 'auto' }}>
                    <Table sx={{ minWidth: 650 }}>
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
                                label={ConnectRequesttatusLabels[request.status]} 
                                color={request.status === 0 ? 'warning' : request.status === 1 ? 'success' : 'error'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Box display="flex" gap={1} flexWrap="wrap" alignItems="center">
                                <Button
                                  size="small"
                                  variant="outlined"
                                  startIcon={<Visibility />}
                                  onClick={() => handleViewProfile(request.senderId)}
                                  sx={{ minWidth: 'auto' }}
                                >
                                  View Profile
                                </Button>
                                {request.status === 0 ? (
                                  <>
                                    <Button
                                      size="small"
                                      variant="contained"
                                      color="success"
                                      startIcon={<CheckCircle />}
                                      onClick={() => handleAccept(request.senderId)}
                                      disabled={acceptMutation.isPending || rejectMutation.isPending}
                                      sx={{ minWidth: '80px' }}
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
                                      sx={{ minWidth: '80px' }}
                                    >
                                      Reject
                                    </Button>
                                  </>
                                ) : (
                                  <Typography variant="body2" color="textSecondary">
                                    {request.status === 1 ? 'Accepted' : 'Rejected'}
                                  </Typography>
                                )}
                              </Box>
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
                                label={ConnectRequesttatusLabels[request.status]} 
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

      {/* Profile View Dialog */}
      <Dialog
        open={profileDialogOpen}
        onClose={handleCloseProfileDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {senderProfile ? `${senderProfile.fullName}'s Profile` : 'Loading Profile...'}
        </DialogTitle>
        <DialogContent>
          {loadingProfile ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : senderProfile ? (
            <Box>
              <Box display="flex" alignItems="center" mb={3}>
                <Avatar
                  sx={{ width: 80, height: 80, mr: 3 }}
                  src={senderProfile.hasProfilePhoto ? `http://localhost:5000/api/users/${senderProfile.id}/photo` : undefined}
                >
                  {senderProfile.fullName.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h5" gutterBottom>
                    {senderProfile.fullName}
                  </Typography>
                  <Chip 
                    label={senderProfile.status === 1 ? 'Active' : 'Inactive'} 
                    color={senderProfile.status === 1 ? 'success' : 'warning'}
                    size="small"
                  />
                </Box>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 3 }}>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Email
                  </Typography>
                  <Typography variant="body1">{senderProfile.email}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Phone
                  </Typography>
                  <Typography variant="body1">{senderProfile.phone}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Ecclesia
                  </Typography>
                  <Typography variant="body1">{senderProfile.ecclesia}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Language
                  </Typography>
                  <Typography variant="body1">{senderProfile.language}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Education
                  </Typography>
                  <Typography variant="body1">{senderProfile.education}</Typography>
                </Box>
              </Box>

              {senderProfile.bio && (
                <Box>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Bio
                  </Typography>
                  <Typography variant="body1">{senderProfile.bio}</Typography>
                </Box>
              )}

              {/* Profile Images */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Photos
                </Typography>
                {loadingProfileImages ? (
                  <Box display="flex" justifyContent="center" p={2}>
                    <CircularProgress size={24} />
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      Loading photos...
                    </Typography>
                  </Box>
                ) : (() => {
                  const allImages = [
                    senderProfile.hasProfilePhoto ? `http://localhost:5000/api/users/${senderProfile.id}/photo` : null,
                    ...(senderProfileImages?.images?.map((img: any) => img.imageUrl) || [])
                  ].filter(Boolean) as string[];

                  return allImages.length > 0 ? (
                    <ImageList cols={3} gap={8}>
                      {allImages.map((imageUrl, index) => (
                        <ImageListItem key={index}>
                          <img
                            src={imageUrl}
                            alt={`${senderProfile.fullName} - ${index + 1}`}
                            loading="lazy"
                            style={{ height: 200, objectFit: 'cover' }}
                            onError={(e) => {
                              console.error('Image load error:', imageUrl, e);
                            }}
                          />
                        </ImageListItem>
                      ))}
                    </ImageList>
                  ) : (
                    <Typography variant="body2" color="textSecondary" align="center" sx={{ py: 2 }}>
                      No photos available for this user.
                    </Typography>
                  );
                })()}
              </Box>
            </Box>
          ) : (
            <Typography color="error">Failed to load profile</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseProfileDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};