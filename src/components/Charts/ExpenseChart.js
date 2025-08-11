import React, { useContext } from 'react'; // Removed useState, useEffect. Added useContext
import { TransactionsContext } from '../../contexts/TransactionsContext'; // Import TransactionsContext

const ExpenseChart = () => { // Removed transactions prop
  const { transactions } = useContext(TransactionsContext); // Use TransactionsContext
  const [chartData, setChartData] = React.useState(null); // Keep local state for derived chart data

  React.useEffect(() => {
    if (transactions && transactions.length > 0) {
      const expenseTransactions = transactions.filter(t => t.type === 'expense');
      const expensesByCategory = expenseTransactions.reduce((acc, transaction) => {
        const category = transaction.category || 'Uncategorized';
        acc[category] = (acc[category] || 0) + parseFloat(transaction.amount);
        return acc;
      }, {});

      if (Object.keys(expensesByCategory).length > 0) {
        const formattedData = Object.entries(expensesByCategory).map(([name, value]) => ({
          name,
          value
        }));
        setChartData(formattedData);
      } else {
        setChartData(null);
      }
    } else {
      setChartData(null);
    }
  }, [transactions]); // Effect now depends on transactions from context

  // Basic color generation for segments - replace with a better palette for real charts
  const getColorForSegment = (index) => {
    const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#C9CBCF'];
    return colors[index % colors.length];
  };

  const totalExpenses = chartData ? chartData.reduce((sum, item) => sum + item.value, 0) : 0;

  return (
    <div className="card mt-4">
      <h3 className="p-3">Expense Breakdown by Category</h3>
      {chartData && chartData.length > 0 ? (
        <div style={{ padding: '20px' }}>
          {/* Placeholder for a proper chart library integration */}
          <p className="text-center mb-2"><strong>Total Expenses: ₹{totalExpenses.toFixed(2)}</strong></p>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
            {chartData.map((item, index) => (
              <div key={item.name} style={{ margin: '10px', textAlign: 'center' }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  backgroundColor: getColorForSegment(index),
                  display: 'inline-block',
                  marginRight: '8px',
                  borderRadius: '3px'
                }}></div>
                <span>{item.name}: ₹{item.value.toFixed(2)} ({(item.value / totalExpenses * 100).toFixed(1)}%)</span>
              </div>
            ))}
          </div>
          <div className="text-center mt-3">
            <em>(Chart visualization would appear here)</em>
          </div>
        </div>
      ) : (
        <p className="text-center p-3">No expense data available to display a chart.</p>
      )}
    </div>
  );
};

export default ExpenseChart;