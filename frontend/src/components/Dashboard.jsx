import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "../config.js";
import { ResponsiveLine } from "@nivo/line";

const Dashboard = () => {
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const expRes = await fetch(`${API_BASE_URL}/expenses/all`);
      const incRes = await fetch(`${API_BASE_URL}/incomes/all`);
      const expData = await expRes.json();
      const incData = await incRes.json();
      setExpenses(expData);
      setIncomes(incData);
      setLoading(false);
    };
    fetchData();
  }, []);

  // Фільтруємо тільки поточний місяць
  const monthExpenses = expenses.filter(e => {
    const d = new Date(e.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const monthIncomes = incomes.filter(i => {
    const d = new Date(i.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const totalExpenses = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalIncomes = monthIncomes.reduce((sum, i) => sum + i.amount, 0);
  const balance = totalIncomes - totalExpenses;

  // Дані для графіка
  const chartData = [
    {
      id: "Expenses",
      color: "hsl(348, 100%, 61%)",
      data: monthExpenses.map(e => ({ x: e.date.split("T")[0], y: e.amount })),
    },
    {
      id: "Incomes",
      color: "hsl(123, 100%, 37%)",
      data: monthIncomes.map(i => ({ x: i.date.split("T")[0], y: i.amount })),
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-4xl font-bold text-blue-500 mb-6">💰 Dashboard</h1>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-gray-800 rounded-lg p-6 shadow flex flex-col">
          <span className="text-gray-400">Total Expenses (this month)</span>
          <span className="text-red-400 text-2xl font-bold">-{totalExpenses} ₴</span>
        </div>
        <div className="bg-gray-800 rounded-lg p-6 shadow flex flex-col">
          <span className="text-gray-400">Total Incomes (this month)</span>
          <span className="text-green-400 text-2xl font-bold">+{totalIncomes} ₴</span>
        </div>
        <div className="bg-gray-800 rounded-lg p-6 shadow flex flex-col">
          <span className="text-gray-400">Balance</span>
          <span className={`text-2xl font-bold ${balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {balance >= 0 ? `+${balance}` : balance} ₴
          </span>
        </div>
      </div>

      {/* Graph */}
      <div className="bg-gray-800 rounded-lg p-6 shadow mb-6" style={{ height: 400 }}>
        {loading ? (
          <p>Loading chart...</p>
        ) : (
          <ResponsiveLine
            data={chartData}
            margin={{ top: 50, right: 50, bottom: 50, left: 60 }}
            xScale={{ type: "point" }}
            yScale={{ type: "linear", min: "auto", max: "auto" }}
            axisBottom={{ orient: "bottom", legend: "Date", legendOffset: 36, legendPosition: "middle" }}
            axisLeft={{ orient: "left", legend: "Amount ₴", legendOffset: -50, legendPosition: "middle" }}
            colors={{ scheme: "category10" }}
            pointSize={8}
            pointColor={{ from: "color" }}
            pointBorderWidth={2}
            pointBorderColor={{ from: "serieColor" }}
            useMesh={true}
            enableSlices="x"
            sliceTooltip={({ slice }) => {
              return (
                <div className="bg-gray-900 p-2 rounded-lg shadow-lg text-white">
                  {slice.points.map(point => (
                    <div key={point.id}>
                      <strong>{point.serieId}: </strong>{point.data.y} ₴
                    </div>
                  ))}
                </div>
              );
            }}
          />
        )}
      </div>

      {/* Recent Transactions */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Recent Transactions</h2>
        <ul className="space-y-2">
          {[...monthExpenses.map(e => ({ ...e, type: "expense" })),
            ...monthIncomes.map(i => ({ ...i, type: "income" }))]
            .sort((a,b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5)
            .map(tx => (
            <li key={tx._id + tx.type} className="bg-gray-800 rounded-lg p-4 flex justify-between items-center shadow hover:bg-gray-700 transition">
              <div>
                <span className="font-medium">{tx.category?.name || tx.source?.name}</span>
                <p className="text-gray-400 text-sm">{new Date(tx.date).toLocaleDateString()}</p>
              </div>
              <span className={tx.type === "expense" ? "text-red-400 font-bold" : "text-green-400 font-bold"}>
                {tx.type === "expense" ? "-" : "+"}{tx.amount} ₴
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
