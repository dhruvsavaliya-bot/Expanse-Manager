import React, { createContext, useState, useEffect, useCallback } from 'react';
import * as storageService from '../utils/storageService';

export const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [loggedInUser, setLoggedInUser] = useState(storageService.getLoggedInUser());
  const [lastUserEmail, setLastUserEmail] = useState(storageService.getLastUserEmail());

  const login = (email, password) => {
    const users = storageService.getUsers();
    const user = users.find(u => u.email === email && u.password === password); // Password check should be secure in a real app
    if (user) {
      const userData = { email: user.email, name: user.name, id: user.id || user.email, password: user.password }; // Added password
      storageService.setLoggedInUser(userData);
      storageService.setLastUserEmail(user.email);
      setLoggedInUser(userData);
      setLastUserEmail(user.email);
      window.dispatchEvent(new Event('authChange')); // For Navbar and other listeners
      return userData;
    }
    return null;
  };

  const logout = useCallback(() => {
    storageService.removeLoggedInUser();
    setLoggedInUser(null);
    window.dispatchEvent(new Event('authChange')); // For Navbar and other listeners
  }, []);

  const register = (name, email, password) => {
    const users = storageService.getUsers();
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      throw new Error('An account with this email already exists.');
    }
    const newUser = { id: email, name, email, password }; // HASH PASSWORDS in real app
    users.push(newUser);
    storageService.saveUsers(users);
    return newUser;
  };

  const changePassword = (userId, currentPassword, newPassword) => {
    const users = storageService.getUsers();
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      return { success: false, message: 'User not found.' };
    }

    // In a real app, currentPassword would be hashed and compared securely.
    // Here, we do a plain text comparison which is NOT secure for production.
    if (users[userIndex].password !== currentPassword) {
      return { success: false, message: 'Incorrect current password.' };
    }

    // HASH newPassword in a real app before saving
    users[userIndex].password = newPassword;
    storageService.saveUsers(users);

    // Update loggedInUser state and local storage with the new password
    const updatedLoggedInUser = { ...loggedInUser, password: newPassword };
    setLoggedInUser(updatedLoggedInUser);
    storageService.setLoggedInUser(updatedLoggedInUser);

    return { success: true, message: 'Password changed successfully.' };
  };
  
  // Effect to update context if localStorage changes (e.g., logout in another tab)
  useEffect(() => {
    const handleStorageChange = () => {
      setLoggedInUser(storageService.getLoggedInUser());
      setLastUserEmail(storageService.getLastUserEmail());
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('authChange', handleStorageChange); // Listen to our custom event

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authChange', handleStorageChange);
    };
  }, []);


  return (
    <UserContext.Provider value={{ loggedInUser, lastUserEmail, login, logout, register, changePassword, setLastUserEmail }}>
      {children}
    </UserContext.Provider>
  );
};