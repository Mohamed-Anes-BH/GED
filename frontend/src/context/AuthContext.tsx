import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../utils/api';
import { jwtDecode } from 'jwt-decode';

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  avatar: string | null;
  role: number | null;
  department: number | null;
  service: number | null;
  role_details?: any;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (access: string, refresh: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Charger l'utilisateur courant au montage
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          // On vérifie le token rapidement
          const decoded = jwtDecode(token);
          if (decoded.exp && decoded.exp * 1000 < Date.now()) {
            throw new Error("Token expired"); // intercepted by axios on api call anyways
          }
          
          const response = await api.get('auth/me/');
          setUser(response.data);
        } catch (error) {
          console.error("Failed to fetch current user", error);
          logout(); // clear tokens if invalid
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  const login = async (access: string, refresh: string) => {
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    
    // Fetch user details immediately after login
    try {
      const response = await api.get('auth/me/');
      setUser(response.data);
    } catch (error) {
      console.error("Failed to fetch user during login", error);
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
