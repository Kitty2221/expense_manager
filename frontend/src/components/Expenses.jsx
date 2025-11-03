// src/pages/Expenses.jsx
import { useEffect, useState } from "react";

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [amount, setAmount] = useState("");
  const [comment, setComment] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchExpenses();
    fetchCategories();
  }, []);

  const fetchExpenses = async () => {
    setLoading(true);
    const res = await fetch("http://127.0.0.1:8000/expenses/all");
    const data = await res.json();
    setExpenses(data);
    setLoading(false);
  };

  const fetchCategories = async () => {
    const res = await fetch("http://127.0.0.1:8000/categories/all");
    const data = await res.json();
    setCategories(data);
  };

  const addExpense = async (e) => {
    e.preventDefault();
    if (!selectedCategory || !amount) return;

    const payload = {
      date: new Date().toISOString(),
      amount: parseFloat(amount),
      comment: comment || "",
      category_name: selectedCategory,
    };

    const response = await fetch("http://127.0.0.1:8000/expenses/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      setAmount("");
      setComment("");
      setSelectedCategory("");
      fetchExpenses();
    } else {
      alert("Failed to add expense");
    }
  };

  return (
    <div className="min-h-screen w-full bg-black text-white flex flex-col items-center py-10 px-4">
      <h2 className="text-4xl font-bold mb-8">💸 My Expenses</h2>

      {/* Form */}
      <form
        onSubmit={addExpense}
        className="flex flex-col md:flex-row gap-4 w-full max-w-3xl mb-8"
      >
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          required
          className="p-3 rounded-lg bg-gray-900 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 flex-1"
        >
          <option value="">Select category...</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat.name}>
              {cat.name}
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          className="p-3 rounded-lg bg-gray-900 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 flex-1"
        />

        <input
          type="text"
          placeholder="Comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="p-3 rounded-lg bg-gray-900 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 flex-1"
        />

        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-700 px-6 py-3 rounded-lg text-white font-semibold transition"
        >
          Add
        </button>
      </form>

      {/* Expenses List */}
      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : expenses.length === 0 ? (
        <p className="text-gray-400">No expenses yet</p>
      ) : (
        <ul className="space-y-4 w-full max-w-3xl">
          {expenses.map((expense) => (
            <li
              key={expense.date + expense.amount + expense.comment}
              className="flex justify-between items-center p-4 rounded-xl bg-gray-900 shadow-lg hover:bg-gray-800 transition"
            >
              <div className="flex flex-col">
                <span className="font-medium text-lg">{expense.category.name}</span>
                {expense.comment && (
                  <span className="text-gray-400 text-sm">{expense.comment}</span>
                )}
              </div>
              <span className="font-bold text-red-400 text-lg">
                -{expense.amount} ₴
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Expenses;
