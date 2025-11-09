import { useEffect, useState, useRef } from "react";
import { API_BASE_URL } from "../config.js";

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [amount, setAmount] = useState("");
  const [comment, setComment] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryQuery, setCategoryQuery] = useState("");
  const [showComment, setShowComment] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);

  const inputRef = useRef(null);

  useEffect(() => {
    fetchExpenses();
    fetchCategories();
  }, []);

  const fetchExpenses = async () => {
    setLoading(true);
    const res = await fetch(`${API_BASE_URL}/expenses/all`);
    const data = await res.json();
    setExpenses(data);
    setLoading(false);
  };

  const fetchCategories = async () => {
    const res = await fetch(`${API_BASE_URL}/categories/all`);
    const data = await res.json();
    setCategories(data);
  };

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(categoryQuery.toLowerCase())
  );

  const addExpense = async (e) => {
    e.preventDefault();
    if (!selectedCategory || !amount) return;

    const payload = {
      date,
      amount: parseFloat(amount),
      comment: comment || "",
      category_name: selectedCategory.name,
    };

    const response = await fetch(`${API_BASE_URL}/expenses/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      setAmount("");
      setComment("");
      setSelectedCategory(null);
      setCategoryQuery("");
      setDate(new Date().toISOString().split("T")[0]);
      setHighlightIndex(0);
      fetchExpenses();
      inputRef.current.focus();
    } else {
      alert("Failed to add expense");
    }
  };

  const handleKeyDown = (e) => {
    if (filteredCategories.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((prev) => (prev + 1) % filteredCategories.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex(
        (prev) => (prev - 1 + filteredCategories.length) % filteredCategories.length
      );
    } else if (e.key === "Enter") {
      if (!selectedCategory && filteredCategories[highlightIndex]) {
        e.preventDefault();
        setSelectedCategory(filteredCategories[highlightIndex]);
        setCategoryQuery(filteredCategories[highlightIndex].name);
      }
    }
  };

  return (
    <div className="min-h-screen w-full bg-black text-white flex flex-col items-center py-10 px-4">
      <h2 className="text-4xl font-bold mb-8">💸 My Expenses</h2>

      <form
        onSubmit={addExpense}
        className="flex flex-col md:flex-row gap-2 w-full max-w-3xl items-center mb-8 relative"
      >
        {/* Category input */}
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Category"
            value={categoryQuery}
            ref={inputRef}
            onChange={(e) => {
              setCategoryQuery(e.target.value);
              setSelectedCategory(null);
              setHighlightIndex(0);
            }}
            onKeyDown={handleKeyDown}
            required
            className="p-3 rounded-lg bg-gray-900 border border-gray-700 text-white w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          {categoryQuery && !selectedCategory && filteredCategories.length > 0 && (
            <ul className="absolute bg-gray-800 mt-1 w-full max-h-40 overflow-y-auto rounded-lg border border-gray-700 z-10">
              {filteredCategories.map((cat, index) => (
                <li
                  key={cat._id}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setCategoryQuery(cat.name);
                  }}
                  className={`p-2 cursor-pointer flex items-center gap-2 hover:bg-gray-700 ${
                    index === highlightIndex ? "bg-gray-700" : ""
                  }`}
                >
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: cat.color || "#6366f1" }}
                  ></span>
                  {cat.name}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Amount */}
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          className="p-3 rounded-lg bg-gray-900 border border-gray-700 text-white w-24 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        {/* Date */}
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="p-3 rounded-lg bg-gray-900 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        {/* Comment */}
        {showComment && (
          <input
            type="text"
            placeholder="Comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="p-3 rounded-lg bg-gray-900 border border-gray-700 text-white flex-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        )}
        <button
          type="button"
          onClick={() => setShowComment(!showComment)}
          className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
        >
          {showComment ? "–" : "+"}
        </button>

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
              key={expense._id}
              className="flex justify-between items-center p-4 rounded-xl bg-gray-900 shadow-lg hover:bg-gray-800 transition"
            >
              <div className="flex flex-col">
                <span className="font-medium text-lg">
                  {expense.category?.name || "Unknown"}
                </span>
                {expense.comment && (
                  <span className="text-gray-400 text-sm">{expense.comment}</span>
                )}
                <span className="text-gray-500 text-sm">{expense.date.split("T")[0]}</span>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-bold text-red-400 text-lg">
                  -{expense.amount} ₴
                </span>
                <button
                  onClick={() => handleDelete(expense._id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md transition"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Expenses;
