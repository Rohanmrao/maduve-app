import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  AppBar,
  Toolbar
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

export const Landing: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box>
             <AppBar position="static">
         <Toolbar>
           <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
             Maduve Site
           </Typography>
                       <Button color="inherit" onClick={() => navigate('/login')}>
              User Login
            </Button>
            <Button color="inherit" onClick={() => navigate('/admin-login')}>
              Admin Login
            </Button>
           <Button color="inherit" onClick={() => navigate('/signup')}>
             Sign Up
           </Button>
         </Toolbar>
       </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box textAlign="center" mb={6}>
          <Typography variant="h2" component="h1" gutterBottom>
            Find Your Perfect Match
          </Typography>
          <Typography variant="h5" color="textSecondary" paragraph>
            Join our Christadelphian matrimonial platform to connect with like-minded individuals
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/signup')}
            sx={{ mr: 2 }}
          >
            Get Started
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate('/login')}
          >
            Login
          </Button>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Create Profile
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Build your detailed profile with photos, education, and personal information to help others get to know you better.
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Find Matches
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Browse through profiles and find potential matches based on your preferences and values.
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Connect Safely
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Send connection requests and communicate with potential partners in a safe, moderated environment.
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Container>
    </Box>
  );
};
