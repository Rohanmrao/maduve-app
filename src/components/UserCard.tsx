import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Avatar,
  Button,
  Chip,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  ImageList,
  ImageListItem
} from '@mui/material';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { connectService, userService } from '../services';
import { User, UserStatusLabels } from '../types';

interface UserCardProps {
  user: User;
  onSelect?: () => void;
  expanded?: boolean;
}

export const UserCard: React.FC<UserCardProps> = ({ user, onSelect, expanded = false }) => {
  const { user: currentUser } = useAuth();
  const [connectDialogOpen, setConnectDialogOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  const { data: connectionStatus } = useQuery({
    queryKey: ['connection-status', currentUser?.id, user.id],
    queryFn: () => connectService.checkConnectionStatus(currentUser?.id || '', user.id),
    enabled: !!currentUser?.id && expanded
  });

  const { data: profileImages } = useQuery({
    queryKey: ['ProfileImages', user.id],
    queryFn: () => userService.getAllProfileImages(user.id),
    enabled: expanded,
    retry: false
  });

  const sendConnectMutation = useMutation({
    mutationFn: () => connectService.sendConnectRequest(
      currentUser?.id || '',
      user.id,
      message
    ),
    onSuccess: () => {
      setConnectDialogOpen(false);
      setMessage('');
      setError('');
      queryClient.invalidateQueries({ queryKey: ['ConnectRequest'] });
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to send connect request');
    }
  });

  const handleSendConnect = () => {
    if (!message.trim()) {
      setError('Please enter a message');
      return;
    }
    sendConnectMutation.mutate();
  };

  const handleConnectClick = () => {
    setConnectDialogOpen(true);
    setError('');
  };

  if (expanded) {
    const allImages = [
      user.hasProfilePhoto ? `http://localhost:5000/api/users/${user.id}/photo` : null,
      ...(profileImages?.images.map(img => `http://localhost:5000${img.imageUrl.replace('/profile-image/', '/ProfileImage/')}`) || [])
    ].filter(Boolean) as string[];

    return (
      <Box>
        <Box display="flex" alignItems="center" mb={2}>
          <Avatar
            sx={{ width: 100, height: 100, mr: 3 }}
            src={user.hasProfilePhoto ? `http://localhost:5000/api/users/${user.id}/photo` : undefined}
          >
            {user.fullName.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="h5" gutterBottom>
              {user.fullName}
            </Typography>
            <Chip 
              label={UserStatusLabels[user.status]} 
              color={user.status === 1 ? 'success' : 'warning'}
            />
          </Box>
        </Box>

        {allImages.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Photos
            </Typography>
            <ImageList cols={3} gap={8}>
              {allImages.map((imageUrl, index) => (
                <ImageListItem key={index}>
                  <img
                    src={imageUrl}
                    alt={`${user.fullName} - ${index + 1}`}
                    loading="lazy"
                    style={{ height: 200, objectFit: 'cover' }}
                  />
                </ImageListItem>
              ))}
            </ImageList>
          </Box>
        )}

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
          <Box>
            <Typography variant="subtitle1" color="textSecondary">
              Email
            </Typography>
            <Typography variant="body1" gutterBottom>
              {user.email}
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle1" color="textSecondary">
              Phone
            </Typography>
            <Typography variant="body1" gutterBottom>
              {user.phone}
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle1" color="textSecondary">
              Ecclesia
            </Typography>
            <Typography variant="body1" gutterBottom>
              {user.ecclesia}
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle1" color="textSecondary">
              Language
            </Typography>
            <Typography variant="body1" gutterBottom>
              {user.language}
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle1" color="textSecondary">
              Education
            </Typography>
            <Typography variant="body1" gutterBottom>
              {user.education}
            </Typography>
          </Box>
          <Box sx={{ gridColumn: '1 / -1' }}>
            <Typography variant="subtitle1" color="textSecondary">
              Bio
            </Typography>
            <Typography variant="body1">
              {user.bio}
            </Typography>
          </Box>
        </Box>

        <Box mt={2}>
          {connectionStatus?.hasActiveConnection ? (
            <Chip label="Already Connected" color="success" />
          ) : (
            <Button
              variant="contained"
              color="primary"
              onClick={handleConnectClick}
              disabled={sendConnectMutation.isPending}
            >
              Send Connect Request
            </Button>
          )}
        </Box>
      </Box>
    );
  }

  return (
    <>
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ flexGrow: 1 }}>
          <Box display="flex" alignItems="center" mb={2}>
            <Avatar
              sx={{ width: 60, height: 60, mr: 2 }}
              src={user.hasProfilePhoto ? `http://localhost:5000/api/users/${user.id}/photo` : undefined}
            >
              {user.fullName.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="h6" noWrap>
                {user.fullName}
              </Typography>
              <Chip 
                label={UserStatusLabels[user.status]} 
                color={user.status === 1 ? 'success' : 'warning'}
                size="small"
              />
            </Box>
          </Box>

          <Typography variant="body2" color="textSecondary" gutterBottom>
            {user.ecclesia}
          </Typography>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            {user.education}
          </Typography>
          <Typography variant="body2" color="textSecondary" noWrap>
            {user.bio}
          </Typography>
        </CardContent>

        <CardActions>
          <Button size="small" onClick={onSelect}>
            View Details
          </Button>
          <Button 
            size="small" 
            variant="contained"
            onClick={handleConnectClick}
            disabled={sendConnectMutation.isPending}
          >
            Connect
          </Button>
        </CardActions>
      </Card>

      <Dialog open={connectDialogOpen} onClose={() => setConnectDialogOpen(false)}>
        <DialogTitle>Send Connect Request to {user.fullName}</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write a message to introduce yourself..."
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConnectDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleSendConnect}
            variant="contained"
            disabled={sendConnectMutation.isPending}
          >
            Send Request
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
