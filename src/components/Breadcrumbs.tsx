import React from 'react';
import { Breadcrumbs as MuiBreadcrumbs, Link, Typography, Box } from '@mui/material';
import { NavigateNext, Home } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  const navigate = useNavigate();

  const handleClick = (path?: string) => (event: React.MouseEvent) => {
    event.preventDefault();
    if (path) {
      navigate(path);
    }
  };

  return (
    <Box sx={{ mb: 3 }}>
      <MuiBreadcrumbs separator={<NavigateNext fontSize="small" />} aria-label="breadcrumb">
        <Link
          component="button"
          onClick={handleClick('/')}
          sx={{
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
            color: 'inherit',
            cursor: 'pointer',
            '&:hover': {
              textDecoration: 'underline',
            },
          }}
        >
          <Home sx={{ mr: 0.5 }} fontSize="small" />
          Home
        </Link>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          
          if (isLast) {
            return (
              <Typography key={index} color="text.primary">
                {item.label}
              </Typography>
            );
          }

          return (
            <Link
              key={index}
              component="button"
              onClick={handleClick(item.path)}
              sx={{
                textDecoration: 'none',
                color: 'inherit',
                cursor: 'pointer',
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </MuiBreadcrumbs>
    </Box>
  );
};

