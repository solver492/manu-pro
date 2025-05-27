
import React, { createContext, useState, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { initialUsers } from '@/data/initialData'; // We'll create this file

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [users, setUsers] = useLocalStorage('users', initialUsers);
  const [currentUser, setCurrentUser] = useLocalStorage('currentUser', null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This simulates checking for an existing session
    const userFromStorage = JSON.parse(localStorage.getItem('currentUser'));
    if (userFromStorage) {
      setCurrentUser(userFromStorage);
    }
    setLoading(false);
  }, []);


  const login = (email, password) => {
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      const { password: _, ...userWithoutPassword } = user; // Don't store password in currentUser
      setCurrentUser(userWithoutPassword);
      return userWithoutPassword;
    }
    return null;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const value = {
    user: currentUser,
    login,
    logout,
    loading, // To handle initial auth check if needed
  };

  if (loading) {
    // Optional: return a loading spinner or null while checking auth state
    return <div className="flex items-center justify-center h-screen bg-background"><p className="text-primary text-xl">Chargement...</p></div>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
  