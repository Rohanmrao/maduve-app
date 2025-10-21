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
  Box
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../services';
import { Admin } from '../types';

interface AdminEditProps {
  open: boolean;
  onClose: () => void;
  admin: Admin | null;
}

export const AdminEdit: React.FC<AdminEditProps> = ({ open, onClose, admin }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const queryClient = useQueryClient();

  useEffect(() => {
    if (admin) {
      setFormData({
        fullName: admin.fullName,
        email: admin.email,
        phone: admin.phone
      });
    }
  }, [admin]);

  const updateMutation = useMutation({
    mutationFn: () => adminService.updateAdmin(admin?.id || '', formData),
    onSuccess: () => {
      setSuccess('Admin updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admins'] });
      setTimeout(() => {
        onClose();
        setSuccess('');
      }, 1500);
    },
    onError: (err: any) => {
      setError(err.response?.data?.error || 'Failed to update admin');
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
    setError('');
    updateMutation.mutate();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Admin</DialogTitle>
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

          <Box sx={{ display: 'grid', gap: 2 }}>
            <TextField
              fullWidth
              label="Full Name"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <TextField
              fullWidth
              label="Phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? <CircularProgress size={24} /> : 'Save Changes'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

