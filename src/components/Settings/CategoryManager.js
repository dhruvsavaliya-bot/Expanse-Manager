import React, { useState, useContext } from 'react';
import { CategoriesContext } from '../../contexts/CategoriesContext';
import { UserContext } from '../../contexts/UserContext';
import Alert from '../common/Alert'; // Import Alert component

const CategoryManager = () => {
  const {
    categories,
    addExpenseCategory,
    addIncomeCategory,
    deleteExpenseCategory,
    deleteIncomeCategory
  } = useContext(CategoriesContext);
  const { loggedInUser } = useContext(UserContext);

  const [newExpenseCat, setNewExpenseCat] = useState('');
  const [newIncomeCat, setNewIncomeCat] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleAddCategory = (type) => {
    setError('');
    setSuccess('');
    if (!loggedInUser) {
      setError("You must be logged in to manage categories.");
      return;
    }

    let added = false;
    if (type === 'expense') {
      if (!newExpenseCat.trim()) {
        setError("Expense category name cannot be empty.");
        return;
      }
      added = addExpenseCategory(newExpenseCat.trim());
      if (added) {
        setSuccess(`Expense category "${newExpenseCat.trim()}" added.`);
        setNewExpenseCat('');
      } else {
        setError(`Expense category "${newExpenseCat.trim()}" already exists or could not be added.`);
      }
    } else if (type === 'income') {
      if (!newIncomeCat.trim()) {
        setError("Income category name cannot be empty.");
        return;
      }
      added = addIncomeCategory(newIncomeCat.trim());
      if (added) {
        setSuccess(`Income category "${newIncomeCat.trim()}" added.`);
        setNewIncomeCat('');
      } else {
        setError(`Income category "${newIncomeCat.trim()}" already exists or could not be added.`);
      }
    }
  };

  const handleDeleteCategory = (type, categoryToDelete) => {
    setError('');
    setSuccess('');
    if (!loggedInUser) {
      setError("You must be logged in to manage categories.");
      return;
    }
    if (window.confirm(`Are you sure you want to delete the ${type} category "${categoryToDelete}"? This cannot be undone.`)) {
      let deleted = false;
      if (type === 'expense') {
        deleted = deleteExpenseCategory(categoryToDelete);
      } else if (type === 'income') {
        deleted = deleteIncomeCategory(categoryToDelete);
      }

      if (deleted) {
        setSuccess(`${type.charAt(0).toUpperCase() + type.slice(1)} category "${categoryToDelete}" deleted.`);
      } else {
        setError(`Could not delete ${type} category "${categoryToDelete}". It might be a default category or not found.`);
      }
    }
  };

  if (!categories) {
    return <p>Loading categories...</p>;
  }

  return (
    <div className="category-manager-container card mt-4 p-3">
      <h3 className="category-manager-title">Manage Categories</h3>
      {error && <Alert type="error" message={error} />}
      {success && <Alert type="success" message={success} />}

      <div className="row">
        {/* Expense Categories */}
        <div className="col-md-6">
          <h4 className="category-section-title">Expense Categories</h4>
          <ul className="list-group mb-3">
            {categories.expense && categories.expense.map(cat => (
              <li key={`exp-${cat}`} className="list-group-item d-flex justify-content-between align-items-center">
                {cat}
                <button 
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDeleteCategory('expense', cat)}
                  disabled={['Other'].includes(cat)}
                  title={['Other'].includes(cat) ? "Cannot delete default 'Other' category" : "Delete category"}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
          {loggedInUser && (
            <div className="input-group input-group-sm mb-3 add-category-input-group">
              <input
                type="text"
                className="form-control"
                placeholder="New expense category"
                value={newExpenseCat}
                onChange={e => setNewExpenseCat(e.target.value)}
              />
              <button className="btn btn-primary" type="button" onClick={() => handleAddCategory('expense')}>Add</button>
            </div>
          )}
        </div>

        {/* Income Categories */}
        <div className="col-md-6">
          <h4 className="category-section-title">Income Categories</h4>
          <ul className="list-group mb-3">
            {categories.income && categories.income.map(cat => (
              <li key={`inc-${cat}`} className="list-group-item d-flex justify-content-between align-items-center">
                {cat}
                <button 
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDeleteCategory('income', cat)}
                  disabled={['Other'].includes(cat)}
                  title={['Other'].includes(cat) ? "Cannot delete default 'Other' category" : "Delete category"}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
          {loggedInUser && (
            <div className="input-group input-group-sm add-category-input-group">
              <input
                type="text"
                className="form-control"
                placeholder="New income category"
                value={newIncomeCat}
                onChange={e => setNewIncomeCat(e.target.value)}
              />
              <button className="btn btn-primary" type="button" onClick={() => handleAddCategory('income')}>Add</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryManager;
