import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('userInfo');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user && user.token) {
      Promise.all([
        axios.get('http://localhost:5000/api/users/favorites', {
          headers: { Authorization: `Bearer ${user.token}` }
        }),
        axios.get('http://localhost:5000/api/collections', {
          headers: { Authorization: `Bearer ${user.token}` }
        }),
        axios.get('http://localhost:5000/api/users/subscriptions', {
          headers: { Authorization: `Bearer ${user.token}` }
        })
      ]).then(([favRes, colRes, subRes]) => {
        const favIds = favRes.data.map(t => t._id || t);
        const colIds = colRes.data.flatMap(c => c.tools.map(t => t._id || t));
        const allSavedIds = Array.from(new Set([...favIds, ...colIds]));
        localStorage.setItem('favoritesList', JSON.stringify(allSavedIds));
        window.dispatchEvent(new Event('favoritesUpdated'));

        const subIds = subRes.data.map(t => t._id || t);
        localStorage.setItem('alertSubscriptionsList', JSON.stringify(subIds));
        window.dispatchEvent(new Event('subscriptionsUpdated'));
      }).catch(err => console.error('Error fetching favorites, collections & subscriptions:', err));
    } else {
      localStorage.removeItem('favoritesList');
      localStorage.removeItem('alertSubscriptionsList');
      window.dispatchEvent(new Event('favoritesUpdated'));
      window.dispatchEvent(new Event('subscriptionsUpdated'));
    }
  }, [user]);

  const login = async (email, password) => {
    const { data } = await axios.post('http://localhost:5000/api/auth/login', {
      email,
      password,
    });
    setUser(data);
    localStorage.setItem('userInfo', JSON.stringify(data));
    return data;
  };

  const register = async (name, email, password) => {
    const { data } = await axios.post('http://localhost:5000/api/auth/register', {
      name,
      email,
      password,
    });
    setUser(data);
    localStorage.setItem('userInfo', JSON.stringify(data));
    return data;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userInfo');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
