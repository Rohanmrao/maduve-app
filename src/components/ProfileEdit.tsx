import React, { useState, useEffect } from 'react';
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
  IconButton,
  Card,
  CardMedia,
  CardActions
} from '@mui/material';
import { PhotoCamera, Delete } from '@mui/icons-material';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
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
    email: user?.email || '',
    phone: user?.phone || '',
    ecclesia: user?.ecclesia || '',
    language: user?.language || '',
    education: user?.education || '',
    bio: user?.bio || ''
  });
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const queryClient = useQueryClient();

  const { data: profileImages, refetch: refetchImages } = useQuery({
    queryKey: ['ProfileImages', user?.id],
    queryFn: () => userService.getAllProfileImages(user?.id || ''),
    enabled: !!user?.id && open,
    retry: false
  });

  // Update form data when user prop changes
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        ecclesia: user.ecclesia || '',
        language: user.language || '',
        education: user.education || '',
        bio: user.bio || ''
      });
    }
  }, [user]);

  const updateMutation = useMutation({
    mutationFn: () => {
      // Ensure all fields are included in the request
      const updateData = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        ecclesia: formData.ecclesia,
        language: formData.language,
        education: formData.education,
        bio: formData.bio
      };
      return userService.updateUser(user?.id || '', updateData);
    },
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
    
    // Validate required fields
    if (!formData.fullName.trim()) {
      setError('Full name is required');
      return;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return;
    }
    if (!formData.phone.trim()) {
      setError('Phone is required');
      return;
    }
    if (!formData.ecclesia.trim()) {
      setError('Ecclesia is required');
      return;
    }
    if (!formData.language.trim()) {
      setError('Language is required');
      return;
    }
    if (!formData.education.trim()) {
      setError('Education is required');
      return;
    }
    
    setError(''); // Clear any previous errors
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

  const handleProfileImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, imageNumber: number) => {
    const file = event.target.files?.[0];
    if (!file || !user?.id) return;

    try {
      setLoading(true);
      setImageLoading(true);
      await userService.uploadProfileImage(user.id, imageNumber, file);
      queryClient.invalidateQueries({ queryKey: ['user', user.id] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setSuccess(`Profile image ${imageNumber} uploaded successfully. Processing image...`);
      
      // Wait 3 seconds before refetching images to prevent backend overload
      setTimeout(() => {
        refetchImages();
        setImageLoading(false);
        setSuccess(`Profile image ${imageNumber} uploaded and processed successfully`);
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to upload image');
      setImageLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProfileImage = async (imageNumber: number) => {
    if (!user?.id) return;

    try {
      setLoading(true);
      await userService.deleteProfileImage(user.id, imageNumber);
      queryClient.invalidateQueries({ queryKey: ['user', user.id] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      refetchImages();
      setSuccess(`Profile image ${imageNumber} deleted successfully`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete image');
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (imageNumber: number): string | undefined => {
    const image = profileImages?.images.find(img => img.imageNumber === imageNumber);
    return image ? `http://localhost:5000${image.imageUrl.replace('/profile-image/', '/ProfileImage/')}` : undefined;
  };

  const hasImage = (imageNumber: number): boolean => {
    return !!profileImages?.images.find(img => img.imageNumber === imageNumber);
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
              src={user?.hasProfilePhoto ? `http://localhost:5000/api/users/${user.id}/photo` : undefined}
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

          <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 2 }}>
            Additional Profile Images
          </Typography>
          
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, 
            gap: 2, 
            mb: 3 
          }}>
            {[1, 2, 3].map((imageNumber) => (
              <Card key={imageNumber}>
                {hasImage(imageNumber) ? (
                  <>
                    {imageLoading ? (
                      <Box
                        sx={{
                          height: 200,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: 'grey.100'
                        }}
                      >
                        <CircularProgress />
                      </Box>
                    ) : (
                      <CardMedia
                        component="img"
                        height="200"
                        image={getImageUrl(imageNumber)}
                        alt={`Profile image ${imageNumber}`}
                      />
                    )}
                    <CardActions>
                      <Button
                        size="small"
                        color="error"
                        startIcon={<Delete />}
                        onClick={() => handleDeleteProfileImage(imageNumber)}
                        disabled={loading || imageLoading}
                      >
                        Delete
                      </Button>
                    </CardActions>
                  </>
                ) : (
                  <Box
                    sx={{
                      height: 200,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'grey.100'
                    }}
                  >
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Image {imageNumber}
                    </Typography>
                    <input
                      accept="image/*"
                      style={{ display: 'none' }}
                      id={`ProfileImage-${imageNumber}`}
                      type="file"
                      onChange={(e) => handleProfileImageUpload(e, imageNumber)}
                    />
                    <label htmlFor={`ProfileImage-${imageNumber}`}>
                      <IconButton
                        color="primary"
                        aria-label={`upload image ${imageNumber}`}
                        component="span"
                        disabled={loading || imageLoading}
                      >
                        <PhotoCamera />
                      </IconButton>
                    </label>
                  </Box>
                )}
              </Card>
            ))}
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
            <Box sx={{ gridColumn: '1 / -1' }}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled
                helperText="Email cannot be changed"
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
