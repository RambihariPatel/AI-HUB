import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser, useAuth as useClerkAuth } from '@clerk/clerk-react';
import api from '../api/client';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const { getToken } = useClerkAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const syncUser = async () => {
      if (clerkLoaded && clerkUser) {
        try {
          // Send Clerk token to our backend for verification and profile fetch
          const token = await getToken();
          localStorage.setItem('token', token); // Still use localStorage for our api client interceptor

          const { data } = await api.get('/api/auth/me');
          setUser(data);
        } catch (error) {
          console.error('Error syncing user with backend', error);
          // If user doesn't exist in our DB yet, the backend 'me' route should handle creation
          // or we can handle it here if needed.
        }
      } else if (clerkLoaded && !clerkUser) {
        setUser(null);
        localStorage.removeItem('token');
      }
      setLoading(false);
    };

    syncUser();
  }, [clerkUser, clerkLoaded, getToken]);

  const updateUser = (data) => {
    setUser(prev => ({ ...prev, ...data }));
  };

  return (
    <AuthContext.Provider value={{ user, loading, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
