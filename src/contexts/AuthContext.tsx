'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserWithPartner } from '@/types/api';
import { getCurrentUser, isAuthenticated, logoutUser } from '@/services/auth';
import { getCurrentSessionId } from '@/lib/session';

interface AuthContextType {
  user: UserWithPartner | null;
  loading: boolean;
  sessionId: string | null;
  login: (userData: UserWithPartner) => void;
  logout: () => void;
  updateUser: (userData: UserWithPartner) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserWithPartner | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      const currentSessionId = getCurrentSessionId();
      setSessionId(currentSessionId);
      
      if (currentSessionId && isAuthenticated(currentSessionId)) {
        try {
          const userData = await getCurrentUser(currentSessionId);
          setUser(userData);
        } catch (error) {
          console.error('Failed to get current user:', error);
          logoutUser(currentSessionId);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = (userData: UserWithPartner) => {
    setUser(userData);
  };

  const logout = () => {
    if (sessionId) {
      logoutUser(sessionId);
    }
    setUser(null);
  };

  const updateUser = (userData: UserWithPartner) => {
    setUser(userData);
  };

  return (
    <AuthContext.Provider value={{ user, loading, sessionId, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}; 