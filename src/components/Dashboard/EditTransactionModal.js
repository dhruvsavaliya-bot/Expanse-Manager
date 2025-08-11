import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // Import motion and AnimatePresence
import { TransactionsContext } from '../../contexts/TransactionsContext';
import { CategoriesContext } from '../../contexts/CategoriesContext';
import Alert from '../common/Alert'; // Import Alert component

const EditTransactionModal = ({ transaction, onClose, onTransactionUpdated }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');
  const [error, setError] = useState('');
  const { updateTransaction: updateTransFromContext } = useContext(TransactionsContext);
  const { categories } = useContext(CategoriesContext); // Use CategoriesContext

  // Categories are now from context: categories.expense, categories.income

  useEffect(() => {
    if (transaction) {
      setDescription(transaction.description);
      setAmount(transaction.amount.toString());
      setType(transaction.type);
      setCategory(transaction.category);
      setDate(transaction.date); // Assumes date is in 'YYYY-MM-DD' format
    }
  }, [transaction]);

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

    const updatedTransactionData = { // userEmail will be handled by context
      ...transaction, // Keep original id
      description,
      amount: parseFloat(amount),
      type,
      category,
      date,
    };

    try {
      if (updateTransFromContext(updatedTransactionData)) {
        onTransactionUpdated(); // This callback might just be onClose now
        onClose();
      } else {
        setError('Failed to update transaction. User might not be logged in or transaction not found.');
      }
    } catch (err) {
      console.error("Error updating transaction:", err);
      setError('Failed to update transaction.');
    }
  };

  const overlayVariants = {
    visible: { opacity: 1 },
    hidden: { opacity: 0 },
  };

  const modalVariants = {
    hidden: {
      y: "-50px",
      opacity: 0,
      scale: 0.95
    },
    visible: {
      y: "0",
      opacity: 1,
      scale: 1,
      transition: { delay: 0.1, duration: 0.3 }
    },
    exit: {
      y: "50px",
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.2 }
    }
  };

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
    <AnimatePresence>
      {transaction && (
        <motion.div
          className="modal-overlay"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="modal-content"
            variants={modalVariants}
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
            <h3>Edit Transaction</h3>
            {error && <Alert type="error" message={error} />}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="edit-description">Description</label>
                <input type="text" id="edit-description" value={description} onChange={e => setDescription(e.target.value)} required />
              </div>
              <div className="form-group">
                <label htmlFor="edit-amount">Amount (₹)</label>
                <input type="number" id="edit-amount" value={amount} onChange={e => setAmount(e.target.value)} required step="0.01" />
              </div>
              <div className="form-group">
                <label htmlFor="edit-type">Type</label>
                <select id="edit-type" value={type} onChange={e => { setType(e.target.value); setCategory(''); }}>
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="edit-category">Category</label>
                <select id="edit-category" value={category} onChange={e => setCategory(e.target.value)} required>
                  <option value="" disabled>Select category</option>
                  {categories && categories[type] && categories[type].map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="edit-date">Date</label>
                <input type="date" id="edit-date" value={date} onChange={e => setDate(e.target.value)} required />
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
                  Update Transaction
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EditTransactionModal;