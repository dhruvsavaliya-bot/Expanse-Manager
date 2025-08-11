import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import * as storageService from '../utils/storageService';
import { UserContext } from './UserContext';

export const BudgetsContext = createContext(null);

export const BudgetsProvider = ({ children }) => {
  const [budgets, setBudgets] = useState([]);
  const { loggedInUser } = useContext(UserContext);

  const loadUserBudgets = useCallback(() => {
    if (loggedInUser && loggedInUser.email) {
      setBudgets(storageService.getUserBudgets(loggedInUser.email));
    } else {
      setBudgets([]); // Clear budgets if no user
    }
  }, [loggedInUser]);

  useEffect(() => {
    loadUserBudgets();
  }, [loadUserBudgets]);

  const addBudget = (newBudgetData) => {
    if (!loggedInUser || !loggedInUser.email) {
      console.error("Cannot add budget: No user logged in.");
      return false;
    }
    const budgetWithOwner = { ...newBudgetData, userEmail: loggedInUser.email, id: Date.now().toString() };
    storageService.addBudget(budgetWithOwner);
    loadUserBudgets(); // Refresh
    return true;
  };

  const deleteBudget = (budgetId) => {
    if (!loggedInUser || !loggedInUser.email) {
      console.error("Cannot delete budget: No user logged in.");
      return false;
    }
    if (storageService.deleteBudget(budgetId, loggedInUser.email)) {
      loadUserBudgets(); // Refresh
      return true;
    }
    return false;
  };

  return (
    <BudgetsContext.Provider value={{ budgets, addBudget, deleteBudget, refreshBudgets: loadUserBudgets }}>
      {children}
    </BudgetsContext.Provider>
  );
};