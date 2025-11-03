import { useEffect, useState } from "react";

const Incomes = () => {
  const [incomes, setIncomes] = useState([]);
  const [amount, setAmount] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchIncomes();
    fetchCategories();
  }, []);

  const fetchIncomes = async () => {
    setLoading(true);
    const res = await fetch("http://127.0.0.1:8000/incomes/all");
    const data = await res.json();
    setIncomes(data);
    setLoading(false);
  };

  const fetchCategories = async () => {
    const res = await fetch("http://127.0.0.1:8000/income_sources/all");
    const data = await res.json();
    setCategories(data);
  };

  const addIncome = async (e) => {
    e.preventDefault();
    const payload = {
      date: new Date().toISOString(),
      amount: parseFloat(amount),
      source: selectedCategory,
    };

    const response = await fetch("http://127.0.0.1:8000/incomes/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      setAmount("");
      setSelectedCategory("");
      fetchIncomes();
    } else {
      alert("Failed to add income");
    }
  };

  return (
    <div className="min-h-screen bg-black text-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Title */}
        <h2 className="text-3xl font-bold mb-8 text-center tracking-tight">
          💰 My Incomes
        </h2>

        {/* Add Income Form */}
        <form
          onSubmit={addIncome}
          className="bg-gray-900 p-6 rounded-2xl shadow-lg mb-10 space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              required
              className="p-3 rounded-xl bg-gray-800 border border-gray-700 text-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">Select source...</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>

            <input
              type="number"
              placeholder="Amount ₴"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="p-3 rounded-xl bg-gray-800 border border-gray-700 text-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />

            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 transition-all duration-200 text-white font-medium py-3 rounded-xl shadow-md hover:shadow-blue-500/30"
            >
              ➕ Add Income
            </button>
          </div>
        </form>

        {/* Incomes List */}
        {loading ? (
          <p className="text-center text-gray-400">Loading...</p>
        ) : incomes.length === 0 ? (
          <p className="text-center text-gray-500 italic">
            No incomes yet — add one above ☝️
          </p>
        ) : (
          <ul className="space-y-3">
            {incomes.map((income, idx) => (
              <li
                key={idx}
                className="bg-gray-900 p-4 rounded-2xl flex justify-between items-center hover:bg-gray-800 transition-transform duration-200 hover:scale-[1.01]"
              >
                <div>
                  <p className="text-lg font-semibold text-white">
                    {income.source || "Unknown"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(income.date).toLocaleDateString()}
                  </p>
                </div>
                <p className="text-xl font-bold text-green-400">
                  +{income.amount} ₴
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Incomes;
