import React, { useState, useEffect, lazy, Suspense, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // Import motion and AnimatePresence
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../contexts/UserContext';
import { TransactionsContext } from '../../contexts/TransactionsContext';
import { BudgetsContext } from '../../contexts/BudgetsContext';
import { CategoriesContext } from '../../contexts/CategoriesContext';
import Alert from '../common/Alert'; 

const BudgetManager = lazy(() => import('../Budget/BudgetManager'));
const ExpenseChart = lazy(() => import('../Charts/ExpenseChart'));
const EditTransactionModal = lazy(() => import('./EditTransactionModal'));

const Dashboard = () => {
  const { loggedInUser, logout } = useContext(UserContext);
  const { transactions, deleteTransaction: deleteTransFromContext, refreshTransactions } = useContext(TransactionsContext); // Use TransactionsContext
  const { budgets, refreshBudgets } = useContext(BudgetsContext); // Use BudgetsContext

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [budgetAlerts, setBudgetAlerts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loggedInUser) {
      navigate('/login');
    } else {
      // refreshTransactions(); 
      // refreshBudgets();
    }
  }, [loggedInUser, navigate, refreshTransactions, refreshBudgets]);


  useEffect(() => {
    if (!loggedInUser || !loggedInUser.email || transactions.length === 0 || budgets.length === 0) {
      setBudgetAlerts([]);
      return;
    }

    const checkBudgets = () => {
      const newAlerts = [];
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();

      budgets.forEach(budget => { 
        if (budget.userEmail !== loggedInUser.email) return;

        let relevantExpenses = transactions.filter(t => {
          if (t.type !== 'expense' || t.userEmail !== loggedInUser.email) return false;
          
          const transactionDate = new Date(t.date);
          const transactionMonth = transactionDate.getMonth();
          const transactionYear = transactionDate.getFullYear();

          if (budget.category === 'Overall') {
            if (budget.period === 'monthly' && transactionMonth === currentMonth && transactionYear === currentYear) return true;
            return false;
          } else if (t.category === budget.category) {
            if (budget.period === 'monthly' && transactionMonth === currentMonth && transactionYear === currentYear) return true;
            return false;
          }
          return false;
        });

        const totalSpentInCategory = relevantExpenses.reduce((sum, t) => sum + parseFloat(t.amount), 0);

        if (totalSpentInCategory > budget.amount) {
          newAlerts.push(
            `Warning: You have exceeded your ${budget.period} budget of ₹${budget.amount.toFixed(2)} for ${budget.category}. Spent: ₹${totalSpentInCategory.toFixed(2)}.`
          );
        }
      });
      setBudgetAlerts(newAlerts);
    };

    checkBudgets();
  }, [loggedInUser, transactions, budgets]); // Depend on budgets from context as well

  const handleLogout = () => {
    logout();
  };

  const handleDeleteTransaction = (transactionId) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      deleteTransFromContext(transactionId); 
    }
  };

  const handleOpenEditModal = (transaction) => {
    setEditingTransaction(transaction);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setEditingTransaction(null);
    setShowEditModal(false);
  };

  // Placeholder for total income, expenses, balance
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + parseFloat(t.amount), 0);
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + parseFloat(t.amount), 0);
  const balance = totalIncome - totalExpenses;

  const handleExportTransactions = () => {
    if (!transactions || transactions.length === 0) {
      alert('No transactions to export.');
      return;
    }

    let transactionText = "Transaction List:\n\n";
    transactions.forEach(t => {
      transactionText += `Date: ${new Date(t.date).toLocaleDateString()}\n`;
      transactionText += `Description: ${t.description}\n`;
      transactionText += `Category: ${t.category}\n`;
      transactionText += `Amount: ₹${parseFloat(t.amount).toFixed(2)}\n`;
      transactionText += `Type: ${t.type.charAt(0).toUpperCase() + t.type.slice(1)}\n`;
      transactionText += `------------------------------------\n`;
    });

    const blob = new Blob([transactionText], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) { // feature detection
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "transactions.txt");
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      alert("Your browser doesn't support direct file downloads. Please try a different browser or copy the data manually.");
    }
  };

  if (!loggedInUser) {
    // This should ideally be handled by ProtectedRoute or the useEffect above,
    // but as a fallback:
    return <div className="form-container"><p>Loading user data or redirecting...</p></div>;
  }

  const buttonVariants = {
    hover: {
      scale: 1.05,
      transition: { duration: 0.2 }
    },
    tap: {
      scale: 0.95
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Welcome, {loggedInUser.name}!</h2>
        <motion.button
          onClick={handleLogout}
          className="btn btn-secondary"
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          Logout
        </motion.button>
      </div>

      {/* Budget Alerts */}
      {budgetAlerts.length > 0 && (
        <Alert type="warning" title="Budget Alerts:" messages={budgetAlerts} />
      )}

      {/* Summary Cards */}
      <motion.div
        className="dashboard-grid mb-4"
        initial="hidden"
        animate="visible"
        variants={{
          visible: { transition: { staggerChildren: 0.1 } },
          hidden: {},
        }}
      >
        <motion.div
          className="card summary-card"
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 },
          }}
        >
          <h3>Total Income</h3>
          <p>₹{totalIncome.toFixed(2)}</p>
        </motion.div>
        <motion.div
          className="card summary-card"
          style={{ backgroundColor: '#e74c3c' /* Red for expenses */ }}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 },
          }}
        >
          <h3>Total Expenses</h3>
          <p>₹{totalExpenses.toFixed(2)}</p>
        </motion.div>
        <motion.div
          className="card summary-card"
          style={{ backgroundColor: balance >= 0 ? '#2ecc71' : '#e74c3c' }}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 },
          }}
        >
          <h3>Balance</h3>
          <p>₹{balance.toFixed(2)}</p>
        </motion.div>
      </motion.div>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Recent Transactions</h3>
        <div>
          <motion.button
            className="btn btn-primary me-2"
            onClick={() => setShowAddModal(true)}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            + Add Transaction
          </motion.button>
          <motion.button
            className="btn btn-info"
            onClick={handleExportTransactions}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            Export Transactions (TXT)
          </motion.button>
        </div>
      </div>

      {/* Transactions Table/List */}
      {transactions.length > 0 ? (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Type</th>
                <th>Actions</th>
              </tr>
            </thead>
            <motion.tbody
              initial="hidden"
              animate="visible"
              variants={{
                visible: { transition: { staggerChildren: 0.05 } },
                hidden: {},
              }}
            >
              {transactions.map((t) => (
                <motion.tr
                  key={t.id} // Use t.id for stable key
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  exit={{ opacity: 0, x: -50 }} // Example exit animation
                  layout // Animate layout changes
                >
                  <td>{new Date(t.date).toLocaleDateString()}</td>
                  <td>{t.description}</td>
                  <td>{t.category}</td>
                  <td className={t.type === 'income' ? 'transaction-amount income' : 'transaction-amount expense'}>
                    ₹{parseFloat(t.amount).toFixed(2)}
                  </td>
                  <td>
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: '4px',
                      color: 'white',
                      backgroundColor: t.type === 'income' ? '#2ecc71' : '#e74c3c'
                    }}>
                      {t.type.charAt(0).toUpperCase() + t.type.slice(1)}
                    </span>
                  </td>
                  <td>
                    <motion.button
                      className="btn btn-secondary btn-sm me-1" // Added me-1 for spacing
                      onClick={() => handleOpenEditModal(t)}
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                    >
                      Edit
                    </motion.button>
                    <motion.button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDeleteTransaction(t.id)}
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                    >
                      Delete
                    </motion.button>
                  </td>
                </motion.tr>
              ))}
            </motion.tbody>
          </table>
        </div>
      ) : (
        <div className="card text-center p-3">
          <p>No transactions yet. Add your first one!</p>
        </div>
      )}

      {/* Add Transaction Modal */}
      <AnimatePresence>
        {showAddModal && (
          <AddTransactionModal
            onClose={() => setShowAddModal(false)}
            // userEmail is now handled by TransactionsContext's addTransaction
            // onTransactionAdded will be handled by context state update triggering re-render
          />
        )}
      </AnimatePresence>

      {/* Edit Transaction Modal */}
      {showEditModal && editingTransaction && loggedInUser && (
        <Suspense fallback={<div>Loading Edit Modal...</div>}>
          <EditTransactionModal
            transaction={editingTransaction}
            // userEmail is handled by TransactionsContext's updateTransaction
            onClose={handleCloseEditModal}
            // onTransactionUpdated will be handled by context state update
            onTransactionUpdated={handleCloseEditModal} // Just close modal, context handles refresh
          />
        </Suspense>
      )}

      {/* Budget Manager Section */}
      {loggedInUser && loggedInUser.email && (
        <Suspense fallback={<div className="card mt-4 p-3 text-center">Loading Budget Manager...</div>}>
          <BudgetManager userEmail={loggedInUser.email} />
        </Suspense>
      )}

      {/* Expense Chart Section */}
      {loggedInUser && transactions.length > 0 && (
         <Suspense fallback={<div className="card mt-4 p-3 text-center">Loading Chart...</div>}>
          <ExpenseChart />
        </Suspense>
      )}
    </div>
  );
};

// Placeholder for AddTransactionModal component (to be created in a separate file)
const AddTransactionModal = ({ onClose }) => {
  const { addTransaction: addTransToContext } = useContext(TransactionsContext);
  const { categories } = useContext(CategoriesContext); // Use CategoriesContext
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState('');

  // Categories are now from context: categories.expense, categories.income

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!description || !amount || !category || !date) {
      setError('Please fill all fields.');
      return;
    }
    if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setError('Please enter a valid positive amount.');
      return;
    }

    const newTransactionData = { // userEmail and id will be added by context
      description,
      amount: parseFloat(amount),
      type,
      category,
      date,
    };

    try {
      if(addTransToContext(newTransactionData)){
        onClose(); // Close modal
      } else {
        setError('Failed to save transaction. User might not be logged in.');
      }
    } catch (err) {
      console.error("Error adding transaction:", err);
      setError('Failed to save transaction.');
    }
  };

  // Variants for AddTransactionModal (can be same as EditTransactionModal)
  const buttonVariants = { // Define buttonVariants for AddTransactionModal scope
    hover: {
      scale: 1.05,
      transition: { duration: 0.2 }
    },
    tap: {
      scale: 0.95
    }
  };

  const modalOverlayVariants = {
    visible: { opacity: 1 },
    hidden: { opacity: 0 },
  };

  const modalContentVariants = {
    hidden: { y: "-50px", opacity: 0, scale: 0.95 },
    visible: { y: "0", opacity: 1, scale: 1, transition: { delay: 0.1, duration: 0.3 } },
    exit: { y: "50px", opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
  };

  return (
    <motion.div
      className="modal-overlay"
      variants={modalOverlayVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="modal-content"
        variants={modalContentVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <motion.button
          className="modal-close-btn"
          onClick={onClose}
          variants={buttonVariants} // You might want different variants for this
          whileHover="hover"
          whileTap="tap"
        >
          &times;
        </motion.button>
        <h3>Add New Transaction</h3>
        {error && <Alert type="error" message={error} />}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <input type="text" id="description" value={description} onChange={e => setDescription(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="amount">Amount (₹)</label>
            <input type="number" id="amount" value={amount} onChange={e => setAmount(e.target.value)} required step="0.01" />
          </div>
          <div className="form-group">
            <label htmlFor="type">Type</label>
            <select id="type" value={type} onChange={e => { setType(e.target.value); setCategory(''); /* Reset category on type change */ }}>
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select id="category" value={category} onChange={e => setCategory(e.target.value)} required>
              <option value="" disabled>Select category</option>
              {categories && categories[type] && categories[type].map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="date">Date</label>
            <input type="date" id="date" value={date} onChange={e => setDate(e.target.value)} required />
          </div>
          <div className="d-flex justify-content-end">
            <motion.button
              type="button"
              className="btn btn-secondary me-2" // Added me-2 for spacing
              onClick={onClose}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              Cancel
            </motion.button>
            <motion.button
              type="submit"
              className="btn btn-primary"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              Add Transaction
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};


export default Dashboard;