import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Box,
  Typography,
  Avatar,
  IconButton
} from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { userService } from '../services';
import { User } from '../types';

interface ProfileEditProps {
  open: boolean;
  onClose: () => void;
  user: User | undefined;
}

export const ProfileEdit: React.FC<ProfileEditProps> = ({ open, onClose, user }) => {
  const { updateUser } = useAuth();
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    ecclesia: user?.ecclesia || '',
    language: user?.language || '',
    education: user?.education || '',
    bio: user?.bio || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: () => userService.updateUser(user?.id || '', formData),
    onSuccess: (updatedUser) => {
      updateUser(updatedUser);
      setSuccess('Profile updated successfully');
      queryClient.invalidateQueries({ queryKey: ['user', user?.id] });
      setTimeout(() => {
        onClose();
        setSuccess('');
      }, 2000);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to update profile');
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate();
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user?.id) return;

    try {
      setLoading(true);
      await userService.uploadProfilePhoto(user.id, file);
      queryClient.invalidateQueries({ queryKey: ['user', user.id] });
      setSuccess('Photo uploaded successfully');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload photo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Edit Profile</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <Box display="flex" alignItems="center" mb={3}>
            <Avatar
              sx={{ width: 80, height: 80, mr: 2 }}
              src={user?.hasProfilePhoto ? `/api/users/${user.id}/photo` : undefined}
            >
              {user?.fullName?.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="h6" gutterBottom>
                Profile Photo
              </Typography>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="photo-upload"
                type="file"
                onChange={handleFileUpload}
              />
              <label htmlFor="photo-upload">
                <IconButton
                  color="primary"
                  aria-label="upload picture"
                  component="span"
                  disabled={loading}
                >
                  <PhotoCamera />
                </IconButton>
              </label>
            </Box>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 2 }}>
            <Box sx={{ gridColumn: '1 / -1' }}>
              <TextField
                fullWidth
                label="Full Name"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </Box>
            <TextField
              fullWidth
              label="Phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
            <TextField
              fullWidth
              label="Ecclesia"
              name="ecclesia"
              value={formData.ecclesia}
              onChange={handleChange}
              required
            />
            <TextField
              fullWidth
              label="Language"
              name="language"
              value={formData.language}
              onChange={handleChange}
              required
            />
            <TextField
              fullWidth
              label="Education"
              name="education"
              value={formData.education}
              onChange={handleChange}
              required
            />
            <Box sx={{ gridColumn: '1 / -1' }}>
              <TextField
                fullWidth
                label="Bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                multiline
                rows={4}
                required
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={updateMutation.isPending || loading}
          >
            {updateMutation.isPending ? <CircularProgress size={24} /> : 'Save Changes'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
