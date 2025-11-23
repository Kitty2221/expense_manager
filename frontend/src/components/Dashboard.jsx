import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ResponsivePie } from "@nivo/pie";
import { ResponsiveTimeRange } from "@nivo/calendar";
import { API_BASE_URL } from "../config.js";

const theme = {
  textColor: "#e5e7eb",
  axis: {
    ticks: { text: { fill: "#e5e7eb" } },
    legend: { text: { fill: "#e5e7eb" } },
  },
  labels: { text: { fill: "#e5e7eb" } },
  tooltip: { container: { background: "#0f172a", color: "#fff" } },
};

export default function Dashboard() {
  const navigate = useNavigate();

  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [expRes, incRes] = await Promise.all([
          fetch(`${API_BASE_URL}/expenses/all`),
          fetch(`${API_BASE_URL}/incomes/all`),
        ]);
        const [expData, incData] = await Promise.all([
          expRes.json(),
          incRes.json(),
        ]);
        setExpenses(Array.isArray(expData) ? expData : []);
        setIncomes(Array.isArray(incData) ? incData : []);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setExpenses([]);
        setIncomes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // month filters
  const monthExpenses = useMemo(
    () =>
      expenses.filter((e) => {
        const d = new Date(e.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      }),
    [expenses, currentMonth, currentYear],
  );

  const monthIncomes = useMemo(
    () =>
      incomes.filter((i) => {
        const d = new Date(i.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      }),
    [incomes, currentMonth, currentYear],
  );

  const totalExpenses = monthExpenses.reduce((s, e) => s + (e.amount || 0), 0);
  const totalIncomes = monthIncomes.reduce((s, i) => s + (i.amount || 0), 0);
  const balance = totalIncomes - totalExpenses;

  const expensesCalendarData = useMemo(
    () =>
      monthExpenses.map((e) => ({
        day: (e.date || "").split("T")[0],
        value: Math.max(0, e.amount || 0),
      })),
    [monthExpenses],
  );

  const incomesCalendarData = useMemo(
    () =>
      monthIncomes.map((i) => ({
        day: (i.date || "").split("T")[0],
        value: Math.max(0, i.amount || 0),
      })),
    [monthIncomes],
  );

  const firstDay = new Date(currentYear, currentMonth, 1)
    .toISOString()
    .split("T")[0];
  const lastDay = new Date(currentYear, currentMonth + 1, 0)
    .toISOString()
    .split("T")[0];

  // pie: categories of expenses for the month
  const pieData = useMemo(() => {
    const map = {};
    monthExpenses.forEach((e) => {
      const cat = e.category?.name || "Uncategorized";
      map[cat] = (map[cat] || 0) + (e.amount || 0);
    });
    const arr = Object.entries(map).map(([id, value]) => ({
      id,
      label: id,
      value,
      color: undefined,
    }));
    if (arr.length === 0) {
      return [
        { id: "No expenses", label: "No expenses", value: 1, color: "#6b7280" },
      ];
    }
    return arr;
  }, [monthExpenses]);

  const calendarCombined = {};

  expensesCalendarData.forEach((item) => {
    if (!calendarCombined[item.day])
      calendarCombined[item.day] = { day: item.day };
    calendarCombined[item.day].expense = item.value;
  });

  incomesCalendarData.forEach((item) => {
    if (!calendarCombined[item.day])
      calendarCombined[item.day] = { day: item.day };
    calendarCombined[item.day].income = item.value;
  });

  const recentTransactions = useMemo(() => {
    const combined = [
      ...monthExpenses.map((e) => ({ ...e, type: "expense" })),
      ...monthIncomes.map((i) => ({ ...i, type: "income" })),
    ];
    return combined
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 6);
  }, [monthExpenses, monthIncomes]);

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* NAVBAR / TITLE */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <h1 className="text-4xl font-bold text-blue-400">💰 Dashboard</h1>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => navigate("/expenses")}
            className="m-1 bg-red-600 hover:bg-white hover:text-red-600 text-white px-3 py-1 rounded-md transition"
          >
            Expenses
          </button>
          <button
            onClick={() => navigate("/incomes")}
            className="m-1 bg-green-600 hover:bg-white hover:text-green-600 text-white px-3 py-1 rounded-md transition"
          >
            Incomes
          </button>
          <button
            onClick={() => navigate("/categories")}
            className="m-1 bg-blue-600 hover:bg-white hover:text-blue-600 text-white px-3 py-1 rounded-md transition"
          >
            Categories
          </button>
          <button
            onClick={() => navigate("/income_sources")}
            className="m-1 bg-pink-600 hover:bg-white hover:text-pink-600 text-white px-3 py-1 rounded-md transition"
          >
            Income Sources
          </button>
        </div>
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-gray-800 rounded-lg p-6 shadow flex flex-col">
          <span className="text-gray-400">Total Expenses (this month)</span>
          <span className="text-red-400 text-2xl font-bold">
            -{totalExpenses} ₴
          </span>
        </div>
        <div className="bg-gray-800 rounded-lg p-6 shadow flex flex-col">
          <span className="text-gray-400">Total Incomes (this month)</span>
          <span className="text-green-400 text-2xl font-bold">
            +{totalIncomes} ₴
          </span>
        </div>
        <div className="bg-gray-800 rounded-lg p-6 shadow flex flex-col">
          <span className="text-gray-400">Balance</span>
          <span
            className={`text-2xl font-bold ${balance >= 0 ? "text-green-400" : "text-red-400"}`}
          >
            {balance >= 0 ? `+${balance}` : balance} ₴
          </span>
        </div>
      </div>

      {/* CALENDAR */}
      <div className="bg-gray-800 rounded-lg p-4 shadow mb-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* === Calendar === */}
          <div className="w-full lg:w-1/2">
            <div className="p-2 text-center text-gray-300">
              Activity calendar
            </div>
            <div className="w-full h-[420px] relative">
              {/* Expenses */}
              <ResponsiveTimeRange
                data={expensesCalendarData}
                from={firstDay}
                to={lastDay}
                colors={["#fee2e2", "#fca5a5", "#f87171", "#ef4444"]}
                emptyColor="rgba(0,0,0,0)"
                dayBorderWidth={1}
                dayBorderColor="#0f172a"
                daySpacing={4}
                dayRadius={4}
                theme={theme}
                margin={{ top: 30, right: 20, bottom: 40, left: 40 }}
                tooltip={({ day, value }) => (
                  <div className="bg-gray-900 text-white p-2 rounded shadow">
                    <strong>{day}</strong>
                    <br />
                    Expense: {value} ₴
                  </div>
                )}
              />
              {/* Incomes */}
              <div className="absolute inset-0 pointer-events-none">
                <ResponsiveTimeRange
                  data={incomesCalendarData}
                  from={firstDay}
                  to={lastDay}
                  colors={["#d1fae5", "#86efac", "#34d399", "#059669"]}
                  emptyColor="rgba(0,0,0,0)"
                  dayBorderWidth={1}
                  dayBorderColor="#0f172a"
                  daySpacing={4}
                  dayRadius={4}
                  theme={theme}
                  margin={{ top: 30, right: 20, bottom: 40, left: 40 }}
                  tooltip={({ day, value }) => (
                    <div className="bg-gray-900 text-white p-2 rounded shadow">
                      <strong>{day}</strong>
                      <br />
                      Income: {value} ₴
                    </div>
                  )}
                />
              </div>
            </div>
          </div>

          {/* === Pie === */}
          <div className="w-full lg:w-1/2 h-[420px] overflow-hidden flex flex-col">
            <div className="p-2 text-center text-red-400;">Expenses pie</div>
            <div className="flex-1">
              <ResponsivePie
                data={pieData}
                theme={theme}
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                innerRadius={0.55}
                padAngle={1.2}
                cornerRadius={6}
                activeOuterRadiusOffset={8}
                colors={{ scheme: "set2" }}
                borderWidth={1}
                borderColor="#0f172a"
                arcLinkLabelsSkipAngle={10}
                arcLinkLabelsTextColor="#e5e7eb"
                arcLabelsSkipAngle={10}
                arcLabelsTextColor="#000"
                tooltip={({ datum }) => (
                  <div className="bg-gray-900 text-white p-2 rounded shadow">
                    <strong>{datum.id}</strong>: {datum.value} ₴
                  </div>
                )}
              />
            </div>
          </div>
        </div>
      </div>

      {/* RECENT TRANSACTIONS */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Recent Transactions</h2>

        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : (
          <ul className="space-y-2">
            {recentTransactions.length === 0 ? (
              <li className="text-gray-400">No transactions this month</li>
            ) : (
              recentTransactions.map((tx) => (
                <li
                  key={tx._id + tx.type}
                  className="bg-gray-800 rounded-lg p-4 flex justify-between items-center shadow hover:bg-gray-700 transition"
                >
                  <div>
                    <div className="font-medium">
                      {tx.type === "expense"
                        ? tx.category?.name || "Expense"
                        : tx.source?.name || "Income"}
                    </div>
                    <div className="text-gray-400 text-sm">
                      {new Date(tx.date).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex flex-col items-end">
                    <div
                      className={
                        tx.type === "expense"
                          ? "text-red-400 font-bold"
                          : "text-green-400 font-bold"
                      }
                    >
                      {tx.type === "expense" ? "-" : "+"}
                      {tx.amount} ₴
                    </div>
                    <div className="text-xs text-gray-500">{tx.type}</div>
                  </div>
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    </div>
  );
}