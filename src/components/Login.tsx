import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Container
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { userService } from '../services';
import { ApplicationStatus } from '../types';
import { Breadcrumbs } from './Breadcrumbs';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [statusEmail, setStatusEmail] = useState('');
  const [applicationStatus, setApplicationStatus] = useState<ApplicationStatus | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await userService.login({ email, password });

      if (response.success) {
        login(response);
        navigate('/dashboard');
      } else {
        setError(response.message);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckStatus = async () => {
    if (!statusEmail) {
      setStatusError('Please enter your email');
      return;
    }

    setStatusLoading(true);
    setStatusError('');
    setApplicationStatus(null);

    try {
      const status = await userService.checkApplicationStatus(statusEmail);
      setApplicationStatus(status);
    } catch (err: any) {
      setStatusError(err.response?.data?.error || 'Failed to check status');
    } finally {
      setStatusLoading(false);
    }
  };

  const handleOpenStatusDialog = () => {
    setStatusDialogOpen(true);
    setStatusError('');
    setApplicationStatus(null);
  };

  const handleCloseStatusDialog = () => {
    setStatusDialogOpen(false);
    setStatusEmail('');
    setApplicationStatus(null);
    setStatusError('');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'grey.100',
        py: 4
      }}
    >
      <Container maxWidth="sm">
        <Breadcrumbs items={[{ label: 'User Login' }]} />
        <Card sx={{ width: '100%' }}>
        <CardContent>
          <Typography variant="h4" align="center" gutterBottom>
            User Login
          </Typography>
          <Typography variant="body1" align="center" color="textSecondary" gutterBottom>
            Welcome back to Maduve Site
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 3, mb: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Login'}
            </Button>
          </form>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Button
              variant="text"
              onClick={() => navigate('/signup')}
            >
              Don't have an account? Sign up
            </Button>
          </Box>

          <Box sx={{ textAlign: 'center', mt: 1 }}>
            <Button
              variant="text"
              onClick={handleOpenStatusDialog}
            >
              Check Application Status
            </Button>
          </Box>

          <Box sx={{ textAlign: 'center', mt: 1 }}>
            <Button
              variant="text"
              onClick={() => navigate('/')}
            >
              Back to Home
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Dialog open={statusDialogOpen} onClose={handleCloseStatusDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Check Application Status</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Enter your email address to check your signup application status
          </Typography>

          {statusError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {statusError}
            </Alert>
          )}

          <TextField
            fullWidth
            label="Email"
            type="email"
            value={statusEmail}
            onChange={(e) => setStatusEmail(e.target.value)}
            margin="normal"
            required
          />

          {applicationStatus && (
            <Box sx={{ mt: 3 }}>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Application Status
              </Typography>
              
              <Box sx={{ display: 'grid', gap: 2 }}>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    Email
                  </Typography>
                  <Typography variant="body1">
                    {applicationStatus.email}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    Status
                  </Typography>
                  <Typography 
                    variant="body1" 
                    color={
                      applicationStatus.status === 1 ? 'success.main' : 
                      applicationStatus.status === 2 ? 'error.main' : 
                      'warning.main'
                    }
                    fontWeight="bold"
                  >
                    {applicationStatus.message}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    Application Submitted
                  </Typography>
                  <Typography variant="body1">
                    {new Date(applicationStatus.createdAt).toLocaleString()}
                  </Typography>
                </Box>

                {applicationStatus.processedAt && (
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary">
                      Processed On
                    </Typography>
                    <Typography variant="body1">
                      {new Date(applicationStatus.processedAt).toLocaleString()}
                    </Typography>
                  </Box>
                )}

                {applicationStatus.adminName && (
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary">
                      Processed By
                    </Typography>
                    <Typography variant="body1">
                      {applicationStatus.adminName}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseStatusDialog}>Close</Button>
          {!applicationStatus && (
            <Button 
              onClick={handleCheckStatus} 
              variant="contained"
              disabled={statusLoading}
            >
              {statusLoading ? <CircularProgress size={24} /> : 'Check Status'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
      </Container>
    </Box>
  );
};
