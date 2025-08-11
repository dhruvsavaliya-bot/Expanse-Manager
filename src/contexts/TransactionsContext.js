import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import * as storageService from '../utils/storageService';
import { UserContext } from './UserContext';

export const TransactionsContext = createContext(null);

export const TransactionsProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);
  const { loggedInUser } = useContext(UserContext);

  const loadUserTransactions = useCallback(() => {
    if (loggedInUser && loggedInUser.email) {
      const userTransactions = storageService.getUserTransactions(loggedInUser.email);
      // Ensure a new array reference is set to trigger re-renders reliably,
      // and handle cases where userTransactions might not be an array.
      setTransactions(Array.isArray(userTransactions) ? [...userTransactions] : []);
    } else {
      setTransactions([]); // Clear transactions if no user is logged in
    }
  }, [loggedInUser]);

  useEffect(() => {
    loadUserTransactions();
  }, [loadUserTransactions]);

  const addTransaction = (newTransactionData) => {
    if (!loggedInUser || !loggedInUser.email) {
      console.error("Cannot add transaction: No user logged in.");
      return false;
    }
    const transactionWithOwner = { ...newTransactionData, userEmail: loggedInUser.email, id: Date.now().toString() };
    storageService.addTransaction(transactionWithOwner);
    loadUserTransactions(); // Refresh transactions from storage
    return true;
  };

  const updateTransaction = (updatedTransactionData) => {
    if (!loggedInUser || !loggedInUser.email) {
      console.error("Cannot update transaction: No user logged in.");
      return false;
    }
    // Ensure userEmail is part of the updatedTransactionData if it's not already
    const transactionToUpdate = { ...updatedTransactionData, userEmail: loggedInUser.email };
    if (storageService.updateTransaction(transactionToUpdate)) {
      loadUserTransactions(); // Refresh
      return true;
    }
    return false;
  };

  const deleteTransaction = (transactionId) => {
    if (!loggedInUser || !loggedInUser.email) {
      console.error("Cannot delete transaction: No user logged in.");
      return false;
    }
    if (storageService.deleteTransaction(transactionId, loggedInUser.email)) {
      loadUserTransactions(); // Refresh
      return true;
    }
    return false;
  };

  return (
    <TransactionsContext.Provider value={{ transactions, addTransaction, updateTransaction, deleteTransaction, refreshTransactions: loadUserTransactions }}>
      {children}
    </TransactionsContext.Provider>
  );
};