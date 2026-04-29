import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useUser, useAuth as useClerkAuth } from '@clerk/clerk-react';
import api from '../api/client';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const { getToken } = useClerkAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const prevClerkUserIdRef = useRef(null);
  const tokenRefreshTimer = useRef(null);

  // Refresh token every 50 seconds (Clerk tokens expire after ~60s)
  const startTokenRefresh = useCallback(async () => {
    const refreshToken = async () => {
      try {
        const token = await getToken();
        if (token) {
          localStorage.setItem('token', token);
        }
      } catch (e) {
        console.error('Token refresh error:', e);
      }
    };

    // Clear existing timer
    if (tokenRefreshTimer.current) clearInterval(tokenRefreshTimer.current);
    
    // Refresh every 50 seconds
    tokenRefreshTimer.current = setInterval(refreshToken, 50 * 1000);
  }, [getToken]);

  useEffect(() => {
    const currentId = clerkUser?.id ?? null;
    if (!clerkLoaded) return;
    if (currentId === prevClerkUserIdRef.current) return;
    prevClerkUserIdRef.current = currentId;

    const syncUser = async () => {
      if (clerkUser) {
        try {
          const token = await getToken();
          if (!token) {
            setLoading(false);
            return;
          }
          localStorage.setItem('token', token);

          const { data } = await api.get('/api/auth/me');
          setUser(data);

          // Start periodic token refresh
          startTokenRefresh();
        } catch (error) {
          console.error('Error syncing user:', error);
          setUser(null);
        }
      } else {
        setUser(null);
        localStorage.removeItem('token');
        if (tokenRefreshTimer.current) clearInterval(tokenRefreshTimer.current);
      }
      setLoading(false);
    };

    syncUser();

    return () => {
      if (tokenRefreshTimer.current) clearInterval(tokenRefreshTimer.current);
    };
  }, [clerkUser, clerkLoaded]);

  const updateUser = (data) => {
    setUser(prev => ({ ...prev, ...data }));
  };

  return (
    <AuthContext.Provider value={{ user, loading, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
