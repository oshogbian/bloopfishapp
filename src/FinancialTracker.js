import React, { useState, useEffect } from 'react';
import './FinancialTracker.css';
import { collection, addDoc, onSnapshot, query } from "firebase/firestore";
import { db } from "./firebaseConfig";

function FinancialTracker() {
  const [transactions, setTransactions] = useState([]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [date, setDate] = useState('');
  const [capital, setCapital] = useState(0); // Initialize to 0 since we'll calculate total later
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const BASE_CAPITAL = 1000000; // Define base capital as a constant

  // Resize event listener to detect screen size changes
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch transactions from Firestore and listen for updates
  useEffect(() => {
    const q = query(collection(db, "transactions"));
    const unsubscribe = onSnapshot(q, snapshot => {
      const fetchedTransactions = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          type: data.type || 'expense', // Default type if not provided
          ...data
        };
      });
      setTransactions(fetchedTransactions);
      
      // Calculate total capital including all capital transactions
      const totalCapitalTransactions = fetchedTransactions
        .filter(t => t.type === 'capital')
        .reduce((sum, t) => sum + (t.amount || 0), 0);
      
      // Update capital with base amount plus all capital transactions
      setCapital(BASE_CAPITAL + totalCapitalTransactions);
    });
    return () => unsubscribe();
  }, []);

  // Handle adding a new transaction
  const addTransaction = async () => {
    if (!description || !amount || !date) {
      alert('Please fill in all fields');
      return;
    }

    const amountValue = parseFloat(amount);

    if (isNaN(amountValue) || amountValue <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    const newTransaction = {
      date,
      description,
      amount: amountValue,
      type,
      timestamp: new Date().toISOString()
    };

    try {
      await addDoc(collection(db, "transactions"), newTransaction);
      
      // Clear form inputs
      setDescription('');
      setAmount('');
      setDate('');
      setType('expense'); // Reset to default type
    } catch (error) {
      console.error("Error adding transaction: ", error);
      alert('Error adding transaction. Please try again.');
    }
  };

  // Calculate totals
  const calculateTotals = () => {
    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const capitalTransactions = transactions
      .filter(t => t.type === 'capital')
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    return {
      expenses,
      income,
      capitalTransactions,
      profit: income - expenses,
      remainingBalance: capital - expenses,
    };
  };

  const { expenses, income, capitalTransactions, profit, remainingBalance } = calculateTotals();

  // Format currency
  const formatCurrency = amount => {
    return `₦${(amount || 0).toLocaleString()}`;
  };

  // Render responsive summaries
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
        <p>{formatCurrency(remainingBalance)}</p>
      </div>
    </div>
  );

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
        <span>Total Income:</span>
        <strong>{formatCurrency(income)}</strong>
      </div>
      <div className="summary-item">
        <span>Profit:</span>
        <strong>{formatCurrency(profit)}</strong>
      </div>
      <div className="summary-item">
        <span>Remaining Balance:</span>
        <strong>{formatCurrency(remainingBalance)}</strong>
      </div>
    </div>
  );

  // Render responsive transaction lists
  const renderMobileTransactions = () => (
    <div className="mobile-transaction-list">
      {transactions
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .map(transaction => (
          <div key={transaction.id} className="mobile-transaction-card">
            <div className="transaction-header">
              <span className="transaction-date">{transaction.date || 'N/A'}</span>
              <span className={`transaction-type ${transaction.type}`}>
                {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
              </span>
            </div>
            <div className="transaction-body">
              <p className="transaction-description">{transaction.description || 'N/A'}</p>
              <p className="transaction-amount">
                {(transaction.type === 'expense' ? '-' : '+')}
                {formatCurrency(transaction.amount)}
              </p>
            </div>
          </div>
        ))}
    </div>
  );

  const renderDesktopTransactions = () => (
    <div className="transaction-table">
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Description</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {transactions
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .map(transaction => (
              <tr key={transaction.id} className={`transaction-row ${transaction.type}`}>
                <td>{transaction.date || 'N/A'}</td>
                <td>
                  {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                </td>
                <td>{transaction.description || 'N/A'}</td>
                <td className="amount-cell">
                  {(transaction.type === 'expense' ? '-' : '')}
                  {formatCurrency(transaction.amount)}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="financial-tracker">
      <div className="tracker-container">
        <h1>Bloop Fish Farm Financial Tracker</h1>

        {isMobile ? renderMobileSummary() : renderDesktopSummary()}

        <div className="transaction-form">
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            required
            placeholder="Date"
          />
          <select 
            value={type} 
            onChange={e => setType(e.target.value)}
            className={`transaction-type-select ${type}`}
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
            <option value="capital">Capital</option>
          </select>
          <input
            type="text"
            placeholder="Description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
          />
          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            required
            min="0"
            step="0.01"
          />
          <button onClick={addTransaction}>Add Transaction</button>
        </div>

        {isMobile ? renderMobileTransactions() : renderDesktopTransactions()}
      </div>
    </div>
  );
}

export default FinancialTracker;