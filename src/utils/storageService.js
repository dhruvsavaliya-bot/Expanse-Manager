// src/utils/storageService.js

const USERS_KEY = 'users';
const LOGGED_IN_USER_KEY = 'loggedInUser';
const LAST_USER_EMAIL_KEY = 'lastUserEmail';
const TRANSACTIONS_KEY = 'transactions';
const BUDGETS_KEY = 'budgets';
const CATEGORIES_KEY = 'categories';

const DEFAULT_EXPENSE_CATEGORIES = ['Food', 'Transport', 'Utilities', 'Entertainment', 'Health', 'Shopping', 'Other'];
const DEFAULT_INCOME_CATEGORIES = ['Salary', 'Bonus', 'Gift', 'Investment', 'Other'];

// --- User Management ---
export const getUsers = () => {
  const users = localStorage.getItem(USERS_KEY);
  return users ? JSON.parse(users) : [];
};

export const saveUsers = (users) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const getLoggedInUser = () => {
  const user = localStorage.getItem(LOGGED_IN_USER_KEY);
  return user ? JSON.parse(user) : null;
};

export const setLoggedInUser = (user) => {
  localStorage.setItem(LOGGED_IN_USER_KEY, JSON.stringify(user));
};

export const removeLoggedInUser = () => {
  localStorage.removeItem(LOGGED_IN_USER_KEY);
};

export const getLastUserEmail = () => {
  return localStorage.getItem(LAST_USER_EMAIL_KEY);
};

export const setLastUserEmail = (email) => {
  localStorage.setItem(LAST_USER_EMAIL_KEY, email);
};

// --- Transaction Management ---
export const getAllTransactions = () => {
  const transactions = localStorage.getItem(TRANSACTIONS_KEY);
  return transactions ? JSON.parse(transactions) : [];
};

export const saveAllTransactions = (transactions) => {
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
};

export const getUserTransactions = (userEmail) => {
  if (!userEmail) return [];
  const allTransactions = getAllTransactions();
  return allTransactions.filter(t => t.userEmail === userEmail);
};

export const addTransaction = (newTransaction) => {
  const allTransactions = getAllTransactions();
  allTransactions.push(newTransaction);
  saveAllTransactions(allTransactions);
};

export const updateTransaction = (updatedTransaction) => {
  let allTransactions = getAllTransactions();
  const index = allTransactions.findIndex(t => t.id === updatedTransaction.id && t.userEmail === updatedTransaction.userEmail);
  if (index !== -1) {
    allTransactions[index] = updatedTransaction;
    saveAllTransactions(allTransactions);
    return true;
  }
  return false; // Or throw error
};

export const deleteTransaction = (transactionId, userEmail) => {
  let allTransactions = getAllTransactions();
  const initialLength = allTransactions.length;
  allTransactions = allTransactions.filter(t => !(t.id === transactionId && t.userEmail === userEmail));
  if (allTransactions.length < initialLength) {
    saveAllTransactions(allTransactions);
    return true;
  }
  return false; // Or throw error
};

// --- Category Management ---
export const getCategories = () => {
  const categories = localStorage.getItem(CATEGORIES_KEY);
  if (categories) {
    return JSON.parse(categories);
  }
  // If no categories in localStorage, initialize with defaults
  const defaultCategories = {
    expense: [...DEFAULT_EXPENSE_CATEGORIES],
    income: [...DEFAULT_INCOME_CATEGORIES],
  };
  saveCategories(defaultCategories);
  return defaultCategories;
};

export const saveCategories = (categories) => {
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
};

// Functions to add/remove categories can be added here if needed
// For example, to add an expense category:
export const addExpenseCategory = (newCategory) => {
  const currentCategories = getCategories();
  if (!currentCategories.expense.includes(newCategory)) {
    currentCategories.expense.push(newCategory);
    saveCategories(currentCategories);
    return true;
  }
  return false; // Category already exists
};

export const addIncomeCategory = (newCategory) => {
  const currentCategories = getCategories();
  if (!currentCategories.income.includes(newCategory)) {
    currentCategories.income.push(newCategory);
    saveCategories(currentCategories);
    return true;
  }
  return false; // Category already exists
};

export const deleteExpenseCategory = (categoryToDelete) => {
  const currentCategories = getCategories();
  const initialLength = currentCategories.expense.length;
  currentCategories.expense = currentCategories.expense.filter(cat => cat !== categoryToDelete);
  if (currentCategories.expense.length < initialLength) {
    saveCategories(currentCategories);
    return true;
  }
  return false; // Category not found
};

export const deleteIncomeCategory = (categoryToDelete) => {
  const currentCategories = getCategories();
  const initialLength = currentCategories.income.length;
  currentCategories.income = currentCategories.income.filter(cat => cat !== categoryToDelete);
  if (currentCategories.income.length < initialLength) {
    saveCategories(currentCategories);
    return true;
  }
  return false; // Category not found
};


// --- Budget Management ---
export const getAllBudgets = () => {
  const budgets = localStorage.getItem(BUDGETS_KEY);
  return budgets ? JSON.parse(budgets) : [];
};

export const saveAllBudgets = (budgets) => {
  localStorage.setItem(BUDGETS_KEY, JSON.stringify(budgets));
};

export const getUserBudgets = (userEmail) => {
  if (!userEmail) return [];
  const allBudgets = getAllBudgets();
  return allBudgets.filter(b => b.userEmail === userEmail);
};

export const addBudget = (newBudget) => {
  const allBudgets = getAllBudgets();
  allBudgets.push(newBudget);
  saveAllBudgets(allBudgets);
};

export const deleteBudget = (budgetId, userEmail) => {
  let allBudgets = getAllBudgets();
  const initialLength = allBudgets.length;
  allBudgets = allBudgets.filter(b => !(b.id === budgetId && b.userEmail === userEmail));
  if (allBudgets.length < initialLength) {
    saveAllBudgets(allBudgets);
    return true;
  }
  return false; // Or throw error
};