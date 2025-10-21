# Maduve Site Frontend

A React TypeScript frontend for the Christadelphian Matrimonial Website, built with Material-UI and TanStack Query.

## Features

- **User Authentication**: Login and signup for both users and admins
- **User Dashboard**: Profile management, user search, and connection requests
- **Admin Dashboard**: User approval system, request management, and analytics
- **Profile Management**: Photo upload, profile editing, and status updates
- **Connection System**: Send and manage connection requests between users
- **Responsive Design**: Mobile-friendly interface using Material-UI
- **Real-time Updates**: TanStack Query for efficient data fetching and caching

## Technology Stack

- **Framework**: React 18 with TypeScript
- **UI Library**: Material-UI (MUI) v5
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Build Tool**: Create React App

## Prerequisites

- Node.js 16+ 
- npm or yarn
- Backend API running on `http://localhost:5000`

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd maduve-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:3000`

## Project Structure

```
src/
├── components/          # React components
│   ├── Login.tsx       # User/Admin login
│   ├── Signup.tsx      # User registration
│   ├── Landing.tsx     # Landing page
│   ├── UserDashboard.tsx # User dashboard
│   ├── AdminDashboard.tsx # Admin dashboard
│   ├── UserCard.tsx    # User profile card
│   └── ProfileEdit.tsx # Profile editing dialog
├── services/           # API services
│   ├── api.ts         # Generic API service
│   ├── userService.ts # User-related API calls
│   ├── adminService.ts # Admin-related API calls
│   ├── connectService.ts # Connection-related API calls
│   └── index.ts       # Service exports
├── hooks/              # Custom React hooks
│   └── useAuth.ts     # Authentication hook
├── types/              # TypeScript interfaces
│   └── index.ts       # Type definitions
└── App.tsx            # Main application component
```

## API Integration

The frontend integrates with the ASP.NET Core backend API with the following endpoints:

### User Management
- `POST /api/users/signup` - User registration
- `POST /api/login/user` - User login
- `GET /api/users` - Get all users
- `PUT /api/users/{id}` - Update user profile
- `GET /api/users/{id}/photo` - Get profile photo

### Admin Management
- `POST /api/login/admin` - Admin login
- `GET /api/admin/dashboard` - Admin dashboard stats
- `GET /api/admin/requests/pending` - Get pending requests
- `POST /api/admin/requests/{id}/approve` - Approve user request
- `POST /api/admin/requests/{id}/reject` - Reject user request

### Connection Requests
- `POST /api/ConnectRequest/sender/{id}/send` - Send connection request
- `POST /api/ConnectRequest/receiver/{id}/accept/{senderId}` - Accept request
- `POST /api/ConnectRequest/receiver/{id}/reject/{senderId}` - Reject request
- `GET /api/ConnectRequest/receiver/{id}/pending` - Get pending requests

## Key Components

### Authentication System
- Dual login system for users and admins
- Protected routes based on user type
- Persistent authentication state

### User Dashboard
- Profile display with photo
- User search and filtering
- Connection request management
- Profile editing capabilities

### Admin Dashboard
- User approval workflow
- Request management interface
- Dashboard statistics
- User status management

### Profile Management
- Photo upload functionality
- Profile information editing
- Status updates
- Image management

## Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

## Environment Configuration

The application expects the backend API to be running on `http://localhost:5000`. To change this, update the `API_BASE_URL` in `src/services/api.ts`.

## Deployment

1. Build the application:
```bash
npm run build
```

2. Deploy the `build` folder to your web server

3. Ensure the backend API is accessible from the deployed frontend

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
