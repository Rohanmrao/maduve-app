import React, { useState } from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  TextField,
  InputAdornment,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Menu,
  MenuItem,
  AppBar,
  Toolbar
} from '@mui/material';
import {
  Search as SearchIcon,
  AccountCircle,
  Logout,
  Edit,
  PhotoCamera
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { userService, connectService } from '../services';
import { User, UserStatusLabels } from '../types';
import { ProfileEdit } from './ProfileEdit';
import { UserCard } from './UserCard';

export const UserDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: userService.getAllUsers
  });

  const { data: currentUser } = useQuery({
    queryKey: ['user', user?.id],
    queryFn: () => userService.getUserById(user?.id || ''),
    enabled: !!user?.id
  });

  const filteredUsers = users.filter(u => 
    u.id !== user?.id && 
    u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) &&
    u.status === 1
  );

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

  const handleEditProfile = () => {
    setEditDialogOpen(true);
    handleMenuClose();
  };

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
  };

  const handleCloseUserDialog = () => {
    setSelectedUser(null);
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Maduve Site
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
            <MenuItem onClick={handleEditProfile}>
              <Edit sx={{ mr: 1 }} />
              Edit Profile
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <Logout sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 3 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar
                  sx={{ width: 80, height: 80, mr: 2 }}
                  src={currentUser?.hasProfilePhoto ? `/api/users/${currentUser.id}/photo` : undefined}
                >
                  {currentUser?.fullName?.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h6">{currentUser?.fullName}</Typography>
                  <Chip 
                    label={UserStatusLabels[currentUser?.status || 0]} 
                    color={currentUser?.status === 1 ? 'success' : 'warning'}
                    size="small"
                  />
                </Box>
              </Box>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                {currentUser?.email}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                {currentUser?.phone}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                {currentUser?.ecclesia}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                {currentUser?.education}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {currentUser?.bio}
              </Typography>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Find Your Match
              </Typography>
              <TextField
                fullWidth
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 3 }}
              />

              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 2 }}>
                {filteredUsers.map((user) => (
                  <UserCard 
                    key={user.id}
                    user={user} 
                    onSelect={() => handleUserSelect(user)}
                  />
                ))}
              </Box>

              {filteredUsers.length === 0 && (
                <Typography variant="body1" color="textSecondary" align="center" sx={{ py: 4 }}>
                  No users found matching your search.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Box>
      </Container>

      <Dialog
        open={!!selectedUser}
        onClose={handleCloseUserDialog}
        maxWidth="md"
        fullWidth
      >
        {selectedUser && (
          <>
            <DialogTitle>{selectedUser.fullName}</DialogTitle>
            <DialogContent>
              <UserCard user={selectedUser} expanded />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseUserDialog}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <ProfileEdit
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        user={currentUser}
      />
    </Box>
  );
};
