import React, { useState, useContext } from 'react'; // Removed useEffect, useCallback
import { BudgetsContext } from '../../contexts/BudgetsContext';
import { UserContext } from '../../contexts/UserContext';
import { CategoriesContext } from '../../contexts/CategoriesContext';
import Alert from '../common/Alert'; // Import Alert component

const BudgetManager = () => {
  const { budgets, addBudget: addBudgetToContext, deleteBudget: deleteBudgetFromContext } = useContext(BudgetsContext);
  const { loggedInUser } = useContext(UserContext);
  const { categories } = useContext(CategoriesContext); // Use CategoriesContext

  const [showAddBudgetModal, setShowAddBudgetModal] = useState(false);
  const [newBudgetCategory, setNewBudgetCategory] = useState('');
  const [newBudgetAmount, setNewBudgetAmount] = useState('');
  const [newBudgetPeriod, setNewBudgetPeriod] = useState('monthly');
  const [error, setError] = useState('');

  // Combine default categories with 'Overall' for budget selection
  const budgetCategoryOptions = () => {
    let options = ['Overall'];
    if (categories && categories.expense) {
      options = [...options, ...categories.expense];
    }
    // Remove duplicates if 'Overall' is somehow in categories.expense
    return [...new Set(options)];
  };

  // Budgets are now loaded and managed by BudgetsContext
  // useEffect(() => {
  //   loadBudgets();
  // }, [loadBudgets]);

  const handleAddBudget = (e) => {
    e.preventDefault();
    setError('');
    if (!newBudgetCategory || !newBudgetAmount || !newBudgetPeriod) {
      setError('Please fill all fields.');
      return;
    }
    if (isNaN(parseFloat(newBudgetAmount)) || parseFloat(newBudgetAmount) <= 0) {
      setError('Please enter a valid positive amount for the budget.');
      return;
    }

    const newBudgetData = { // userEmail and id will be added by context
      category: newBudgetCategory,
      amount: parseFloat(newBudgetAmount),
      period: newBudgetPeriod,
      createdAt: new Date().toISOString(),
    };

    try {
      if (!loggedInUser) {
        setError("You must be logged in to add a budget.");
        return;
      }
      if(addBudgetToContext(newBudgetData)){
        setShowAddBudgetModal(false);
        // Reset form
        setNewBudgetCategory('');
        setNewBudgetAmount('');
        setNewBudgetPeriod('monthly');
      } else {
         setError('Failed to save budget. User might not be logged in.');
      }
    } catch (err) {
      console.error("Error adding budget:", err);
      setError('Failed to save budget.');
    }
  };

  const handleDeleteBudget = (budgetId) => {
    try {
      if (!loggedInUser) {
        setError("You must be logged in to delete a budget.");
        return;
      }
      deleteBudgetFromContext(budgetId);
      // Budgets list will auto-update due to context state change
    } catch (err) {
      console.error("Error deleting budget:", err);
      setError('An unexpected error occurred while deleting the budget.');
    }
  };

  return (
    <div className="card mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3 p-3">
        <h3>My Budgets</h3>
        {loggedInUser && <button className="btn btn-success" onClick={() => setShowAddBudgetModal(true)}>+ Add Budget</button>}
      </div>
      {error && <Alert type="error" message={error} />} {/* Use Alert for general errors */}
      {budgets.length > 0 ? (
        <table className="table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Amount</th>
              <th>Period</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {budgets.map(budget => (
              <tr key={budget.id}>
                <td>{budget.category}</td>
                <td>₹{budget.amount.toFixed(2)}</td>
                <td>{budget.period.charAt(0).toUpperCase() + budget.period.slice(1)}</td>
                <td>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDeleteBudget(budget.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-center p-3">No budgets set yet</p>
      )}

      {showAddBudgetModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close-btn" onClick={() => { setShowAddBudgetModal(false); setError(''); }}>&times;</button>
            <h3>Add New Budget</h3>
            {}
            {}
            <form onSubmit={handleAddBudget}>
              <div className="form-group">
                <label htmlFor="budgetCategory">Category</label>
                <select
                  id="budgetCategory"
                  value={newBudgetCategory}
                  onChange={e => setNewBudgetCategory(e.target.value)}
                  required
                >
                  <option value="" disabled>Select a category</option>
                  {budgetCategoryOptions().map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="budgetAmount">Amount (₹)</label>
                <input
                  type="number"
                  id="budgetAmount"
                  value={newBudgetAmount}
                  onChange={e => setNewBudgetAmount(e.target.value)}
                  placeholder="e.g., 5000"
                  required
                  step="0.01"
                />
              </div>
              <div className="form-group">
                <label htmlFor="budgetPeriod">Period</label>
                <select
                  id="budgetPeriod"
                  value={newBudgetPeriod}
                  onChange={e => setNewBudgetPeriod(e.target.value)}
                >
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <div className="d-flex justify-content-end">
                <button type="button" className="btn btn-secondary" onClick={() => { setShowAddBudgetModal(false); setError(''); }}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Budget</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetManager;