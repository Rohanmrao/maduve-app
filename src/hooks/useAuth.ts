import { useState, useEffect } from 'react';
import { LoginResponse, User, Admin } from '../types';

export const useAuth = () => {
  const [user, setUser] = useState<User | Admin | null>(null);
  const [userType, setUserType] = useState<'User' | 'Admin' | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedUserType = localStorage.getItem('userType');
    
    if (savedUser && savedUserType) {
      setUser(JSON.parse(savedUser));
      setUserType(savedUserType as 'User' | 'Admin');
      setIsAuthenticated(true);
    }
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

  return {
    user,
    userType,
    isAuthenticated,
    login,
    logout,
    updateUser
  };
};