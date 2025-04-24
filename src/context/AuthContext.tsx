import React, { createContext, useContext, useState, useEffect } from 'react';
import { isAuthenticated } from '../utils/auth';
import api from '../api/axios';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<boolean>(isAuthenticated());

  const login = (token: string) => {
    localStorage.setItem('token', token);
    setAuthState(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setAuthState(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated: authState, login, logout }}>
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