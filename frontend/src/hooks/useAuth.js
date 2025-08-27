import { useState, useEffect, createContext, useContext } from 'react';
import * as userService from '../services/userService';
import { toast } from 'react-toastify';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Always get user from localStorage on mount
  const [user, setUser] = useState(() => userService.getUser());

  // Keep user in sync with localStorage on mount
  useEffect(() => {
    const storedUser = userService.getUser();
    if (storedUser && (!user || storedUser._id !== user._id)) {
      setUser(storedUser);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const user = await userService.login(email, password);
      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      toast.success('Login Successful');
    } catch (err) {
      toast.error(err.response?.data || 'Login failed');
    }
  };

  const register = async (data) => {
    try {
      const user = await userService.register(data);
      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      toast.success('Register Successful');
    } catch (err) {
      toast.error(err.response?.data || 'Registration failed');
    }
  };

  const logout = () => {
    userService.logout();
    setUser(null);
    localStorage.removeItem('user');
    toast.success('Logout Successful');
  };

  const updateProfile = async (data) => {
    const updatedUser = await userService.updateProfile(data);
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    return updatedUser;
  };

  return (
    <AuthContext.Provider value={{
      user,
      setUser,
      login,
      register,
      logout,
      updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);