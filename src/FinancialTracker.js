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
  const [capital, setCapital] = useState(1000000);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Responsive check
  useEffect(() => {
   const q = query(collection(db, "transactions"));
 
   const unsubscribe = onSnapshot(q, snapshot => {
     const fetchedTransactions = snapshot.docs.map(doc => ({
       id: doc.id,
       ...doc.data(),
     }));
     setTransactions(fetchedTransactions);
   });
 
   // Cleanup listener on component unmount
   return () => unsubscribe();
 }, []);

  const addTransaction = async () => {
   if (!description || !amount || !date) return;
 
   const amountValue = parseFloat(amount);
 
   const newTransaction = {
     date,
     description,
     amount: amountValue,
     type,
   };
 
   try {
     // Add transaction to Firestore
     await addDoc(collection(db, "transactions"), newTransaction);
 
     // Clear input fields
     setDescription("");
     setAmount("");
     setDate("");
   } catch (error) {
     console.error("Error adding transaction: ", error);
   } 

    if (type === 'capital') {
      setCapital(prevCapital => prevCapital + amountValue);
    }

    setTransactions([...transactions, newTransaction]);

    // Clear input fields
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

    const capitalTransactions = transactions
      .filter(t => t.type === 'capital')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      expenses,
      income,
      capitalTransactions,
      profit: income - expenses,
      remainingBalance: capital - expenses,
    };
  };

  const { expenses, income, capitalTransactions, profit, remainingBalance } = calculateTotals();

  const formatCurrency = amount => {
    return `₦${amount.toLocaleString()}`;
  };

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

  const renderMobileTransactions = () => (
    <div className="mobile-transaction-list">
      {transactions.map(transaction => (
        <div key={transaction.id} className="mobile-transaction-card">
          <div className="transaction-header">
            <span className="transaction-date">{transaction.date}</span>
            <span className={`transaction-type ${transaction.type}`}>
              {transaction.type === 'expense' ? 'Expense' : transaction.type === 'income' ? 'Income' : 'Capital'}
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
          {transactions.map(transaction => (
            <tr key={transaction.id}>
              <td>{transaction.date}</td>
              <td>
                {transaction.type === 'expense' ? 'Expense' : transaction.type === 'income' ? 'Income' : 'Capital'}
              </td>
              <td>{transaction.description}</td>
              <td>{formatCurrency(transaction.amount)}</td>
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
          <select value={type} onChange={e => setType(e.target.value)}>
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
          />
          <button onClick={addTransaction}>Add Transaction</button>
        </div>

        {isMobile ? renderMobileTransactions() : renderDesktopTransactions()}
      </div>
    </div>
  );
}

export default FinancialTracker;
