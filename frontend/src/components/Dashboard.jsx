import React, { useEffect, useState } from "react";

const Dashboard = () => {
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const expRes = await fetch("http://127.0.0.1:8000/expenses/all");
      const incRes = await fetch("http://127.0.0.1:8000/incomes/all");
      const expData = await expRes.json();
      const incData = await incRes.json();
      setExpenses(expData);
      setIncomes(incData);
      setLoading(false);
    };
    fetchData();
  }, []);

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalIncomes = incomes.reduce((sum, i) => sum + i.amount, 0);
  const balance = totalIncomes - totalExpenses;

  const recentTransactions = [...expenses.map(e => ({...e, type: 'expense'})),
                              ...incomes.map(i => ({...i, type: 'income'}))]
                              .sort((a,b) => new Date(b.date) - new Date(a.date))
                              .slice(0, 5);

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-4xl font-bold text-blue-500 mb-6">💰 Dashboard</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-gray-800 rounded-lg p-6 shadow flex flex-col">
          <span className="text-gray-400">Total Expenses</span>
          <span className="text-red-400 text-2xl font-bold">-{totalExpenses} ₴</span>
        </div>
        <div className="bg-gray-800 rounded-lg p-6 shadow flex flex-col">
          <span className="text-gray-400">Total Incomes</span>
          <span className="text-green-400 text-2xl font-bold">+{totalIncomes} ₴</span>
        </div>
        <div className="bg-gray-800 rounded-lg p-6 shadow flex flex-col">
          <span className="text-gray-400">Balance</span>
          <span className={`text-2xl font-bold ${balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {balance >= 0 ? `+${balance}` : balance} ₴
          </span>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="mt-6">
        <h2 className="text-2xl font-semibold mb-4">Recent Transactions</h2>
        {loading ? (
          <p>Loading...</p>
        ) : recentTransactions.length === 0 ? (
          <p className="text-gray-400">No transactions yet</p>
        ) : (
          <ul className="space-y-2">
            {recentTransactions.map(tx => (
              <li key={tx._id + tx.type} className="bg-gray-800 rounded-lg p-4 flex justify-between items-center shadow hover:bg-gray-700 transition">
                <div>
                  <span className="font-medium">{tx.category?.name || tx.source}</span>
                  <p className="text-gray-400 text-sm">{new Date(tx.date).toLocaleString()}</p>
                </div>
                <span className={tx.type === 'expense' ? 'text-red-400 font-bold' : 'text-green-400 font-bold'}>
                  {tx.type === 'expense' ? '-' : '+'}{tx.amount} ₴
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
