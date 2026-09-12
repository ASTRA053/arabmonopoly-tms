import React, { createContext, useContext, useMemo, useState } from 'react';
import { API_BASE_URL } from '../config';
import { stopBackgroundLocationTracking } from '../screens/driver/BackgroundLocation';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    const e = String(email || '').trim().toLowerCase();
    const p = String(password || '');

    if (!e || !p) throw new Error('Email and password are required');

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: e, password: p }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || 'Invalid email or password');
    setCurrentUser({ ...payload.user, token: payload.token });
    return payload.user;
  };

  const logout = async () => {
    await stopBackgroundLocationTracking();
    setCurrentUser(null);
  };

  const value = useMemo(
    () => ({
      currentUser,
      loading,
      setLoading,
      login,
      logout,
      isAdmin: currentUser?.role === 'admin',
      isDriver: currentUser?.role === 'driver',
      isAuthenticated: !!currentUser,
    }),
    [currentUser, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}