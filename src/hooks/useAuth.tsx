import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LoginResponse, User, Admin } from '../types';

interface AuthContextType {
  user: User | Admin | null;
  userType: 'User' | 'Admin' | null;
  isAuthenticated: boolean;
  login: (response: LoginResponse) => void;
  logout: () => void;
  updateUser: (userData: User | Admin) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | Admin | null>(null);
  const [userType, setUserType] = useState<'User' | 'Admin' | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedUserType = localStorage.getItem('userType');
    
    if (savedUser && savedUserType) {
      try {
        setUser(JSON.parse(savedUser));
        setUserType(savedUserType as 'User' | 'Admin');
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Failed to parse saved user data:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('userType');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (response: LoginResponse) => {
    const userData = {
      id: response.userId,
      fullName: response.userName,
      status: response.status
    } as User | Admin;

    setUser(userData);
    setUserType(response.userType);
    setIsAuthenticated(true);

    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('userType', response.userType);
  };

  const logout = () => {
    setUser(null);
    setUserType(null);
    setIsAuthenticated(false);

    localStorage.removeItem('user');
    localStorage.removeItem('userType');
  };

  const updateUser = (userData: User | Admin) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userType,
        isAuthenticated,
        login,
        logout,
        updateUser,
        isLoading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

