import React, { useState, useEffect } from 'react';
import './FinancialTracker.css';

function FinancialTracker() {
  const [transactions, setTransactions] = useState([]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [date, setDate] = useState('');
  const [capital, setCapital] = useState(1000000);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Responsive check
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const addTransaction = () => {
    if (!description || !amount || !date) return;

    const newTransaction = {
      id: Date.now(),
      date,
      description,
      amount: parseFloat(amount),
      type
    };

    const amountValue = parseFloat(amount);
    const newCapital = type === 'expense' 
      ? capital - amountValue 
      : capital + amountValue;

    setTransactions([...transactions, newTransaction]);
    setCapital(newCapital);
    
    setDescription('');
    setAmount('');
    setDate('');
  };

  const calculateTotals = () => {
    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      expenses,
      income,
      profit: income - expenses
    };
  };

  const { expenses, income, profit } = calculateTotals();

  const formatCurrency = (amount) => {
    return `₦${amount.toLocaleString()}`;
  };

  // Mobile view rendering
  const renderMobileSummary = () => (
    <div className="mobile-summary-grid">
      <div className="mobile-summary-card">
        <h3>Capital</h3>
        <p>{formatCurrency(capital)}</p>
      </div>
      <div className="mobile-summary-card">
        <h3>Expenses</h3>
        <p>{formatCurrency(expenses)}</p>
      </div>
      <div className="mobile-summary-card">
        <h3>Income</h3>
        <p>{formatCurrency(income)}</p>
      </div>
      <div className="mobile-summary-card">
        <h3>Profit</h3>
        <p>{formatCurrency(profit)}</p>
      </div>
      <div className="mobile-summary-card">
        <h3>Remaining Balance</h3>
        <p>{formatCurrency(capital - expenses)}</p>
      </div>
    </div>
  );

  // Desktop view rendering
  const renderDesktopSummary = () => (
    <div className="summary-grid">
      <div className="summary-item">
        <span>Capital:</span>
        <strong>{formatCurrency(capital)}</strong>
      </div>
      <div className="summary-item">
        <span>Total Expenses:</span>
        <strong>{formatCurrency(expenses)}</strong>
      </div>
      <div className="summary-item">
        <span>Remaining Balance:</span>
        <strong>{formatCurrency(capital - expenses)}</strong>
      </div>
      <div className="summary-item">
        <span>Income:</span>
        <strong>{formatCurrency(income)}</strong>
      </div>
      <div className="summary-item">
        <span>Profit:</span>
        <strong>{formatCurrency(profit)}</strong>
      </div>
    </div>
  );

  // Mobile transaction list
  const renderMobileTransactions = () => (
    <div className="mobile-transaction-list">
      {transactions.map(transaction => (
        <div key={transaction.id} className="mobile-transaction-card">
          <div className="transaction-header">
            <span className="transaction-date">{transaction.date}</span>
            <span className={`transaction-type ${transaction.type}`}>
              {transaction.type === 'expense' ? 'Expense' : 'Income'}
            </span>
          </div>
          <div className="transaction-body">
            <p className="transaction-description">{transaction.description}</p>
            <p className="transaction-amount">
              {transaction.type === 'expense' ? '-' : '+'}
              {formatCurrency(transaction.amount)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );

  // Desktop transaction table
  const renderDesktopTransactions = () => (
    <div className="transaction-table">
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Transaction Type</th>
            <th>Description</th>
            <th>Capital</th>
            <th>Expenses</th>
            <th>Income</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map(transaction => (
            <tr key={transaction.id}>
              <td>{transaction.date}</td>
              <td>{transaction.type === 'expense' ? 'Expenses' : 'Income'}</td>
              <td>{transaction.description}</td>
              <td>{formatCurrency(capital)}</td>
              <td>{transaction.type === 'expense' ? formatCurrency(transaction.amount) : '₦0'}</td>
              <td>{transaction.type === 'income' ? formatCurrency(transaction.amount) : '₦0'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="financial-tracker">
      <div className="tracker-container">
        <h1>Financial Tracker</h1>
        
        {isMobile ? renderMobileSummary() : renderDesktopSummary()}
        
        <div className="transaction-form">
          <input 
            type="date" 
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            placeholder="Date"
          />
          <select 
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="expense">Expenses</option>
            <option value="income">Income</option>
          </select>
          <input 
            type="text" 
            placeholder="Description" 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          <input 
            type="number" 
            placeholder="Amount" 
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
          <button onClick={addTransaction}>Add Transaction</button>
        </div>
        
        {isMobile ? renderMobileTransactions() : renderDesktopTransactions()}
      </div>
    </div>
  );
}

export default FinancialTracker;