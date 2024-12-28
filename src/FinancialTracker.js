import React, { useState, useEffect } from 'react';
import './FinancialTracker.css';
import { collection, addDoc, onSnapshot, query } from "firebase/firestore";
import { db } from "./firebaseConfig";

function FinancialTracker() {
  // State declarations
  const [transactions, setTransactions] = useState([]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [date, setDate] = useState('');
  const [capital, setCapital] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Format currency helper function
  const formatCurrency = amount => {
    return `₦${(amount || 0).toLocaleString()}`;
  };

  // Calculate totals helper function
  const calculateTotals = () => {
    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    return {
      expenses,
      income,
      profit: income - expenses,
      remainingBalance: capital - expenses,
    };
  };

  // Mobile summary component
  const renderMobileSummary = () => {
    const { expenses, income, profit, remainingBalance } = calculateTotals();
    return (
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
  };

  // Desktop summary component
  const renderDesktopSummary = () => {
    const { expenses, income, profit, remainingBalance } = calculateTotals();
    return (
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
  };

  // Mobile transactions component
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

  // Desktop transactions component
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

  // Add transaction handler
  const handleAddTransaction = async () => {
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
      setDescription('');
      setAmount('');
      setDate('');
      setType('expense');
    } catch (error) {
      console.error("Error adding transaction: ", error);
      alert('Error adding transaction. Please try again.');
    }
  };

  // Effect for window resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Effect for fetching transactions
  useEffect(() => {
    const q = query(collection(db, "transactions"));
    const unsubscribe = onSnapshot(q, snapshot => {
      const fetchedTransactions = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          type: data.type || 'expense',
          ...data
        };
      });
      setTransactions(fetchedTransactions);
      
      const totalCapital = fetchedTransactions
        .filter(t => t.type === 'capital')
        .reduce((sum, t) => sum + (t.amount || 0), 0);
      
      setCapital(totalCapital);
    });
    return () => unsubscribe();
  }, []);

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
          <button onClick={handleAddTransaction}>Add Transaction</button>
        </div>

        {isMobile ? renderMobileTransactions() : renderDesktopTransactions()}
      </div>
      
      <footer className="app-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Contact</h3>
            <p>Email: Emmanuelbalogunn@gmail.com</p>
            <p>WhatsApp: +1 704-534-8737</p>
          </div>
          <div className="footer-section">
            <h3>Address</h3>
            <p>123 Fish Farm Road</p>
            <p>Oshogbo, Osun State, Nigeria</p>
          </div>
          <div className="footer-section">
            <h3>Developer</h3>
            <p>Created by: Emmanuel Balogun</p>
            <p>© 2024 Bloop Fish Farm</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default FinancialTracker;