import { useEffect, useState, useRef } from "react";
import { API_BASE_URL } from "../config.js";
import { useNavigate } from "react-router-dom";

const Incomes = () => {
  const [incomes, setIncomes] = useState([]);
  const [amount, setAmount] = useState("");
  const [sources, setSources] = useState([]);
  const [selectedSource, setSelectedSource] = useState(null);
  const [sourceQuery, setSourceQuery] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);

  const inputRef = useRef(null);

  useEffect(() => {
    fetchIncomes();
    fetchSources();
  }, []);

  const fetchIncomes = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/incomes/all`);
      const data = await res.json();
      setIncomes(data);
    } catch (err) {
      console.error("Failed to fetch incomes:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSources = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/income_sources/all`);
      const data = await res.json();
      setSources(data);
    } catch (err) {
      console.error("Failed to fetch sources:", err);
    }
  };

  const filteredSources = sources.filter((s) =>
    s.name.toLowerCase().includes(sourceQuery.toLowerCase())
  );

  const addIncome = async (e) => {
    e.preventDefault();
    if (!selectedSource || !amount || !date) return;

    const payload = {
      date: new Date(date).toISOString(),
      amount: parseFloat(amount),
      source_name: selectedSource.name,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/incomes/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setAmount("");
        setSelectedSource(null);
        setSourceQuery("");
        setDate(new Date().toISOString().split("T")[0]);
        setHighlightIndex(0);
        fetchIncomes();
        inputRef.current.focus();
      } else {
        alert("Failed to add income");
      }
    } catch (err) {
      console.error("Error adding income:", err);
      alert("Error adding income");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this income?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/incomes/${id}`, {
        method: "DELETE",
      });
      if (res.ok) fetchIncomes();
      else alert("Failed to delete income");
    } catch (err) {
      console.error("Error deleting income:", err);
      alert("Error deleting income");
    }
  };

  const handleKeyDown = (e) => {
    if (filteredSources.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((prev) => (prev + 1) % filteredSources.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex(
        (prev) => (prev - 1 + filteredSources.length) % filteredSources.length
      );
    } else if (e.key === "Enter") {
      if (!selectedSource && filteredSources[highlightIndex]) {
        e.preventDefault();
        setSelectedSource(filteredSources[highlightIndex]);
        setSourceQuery(filteredSources[highlightIndex].name);
      }
    }
  };

  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-black text-white py-12 px-4 flex flex-col items-center">
      <button onClick={() => navigate("/")} className="m-1 bg-green-600 hover:bg-white hover:text-green-600 text-white px-1 py-1 rounded-md transition">Dashboard</button>
      <h2 className="text-4xl font-bold mb-8">💰 My Incomes</h2>

      <form
        onSubmit={addIncome}
        className="flex flex-col md:flex-row gap-2 w-full max-w-3xl items-center mb-8 relative"
      >
        {/* Source input */}
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Source"
            value={sourceQuery}
            ref={inputRef}
            onChange={(e) => {
              setSourceQuery(e.target.value);
              setSelectedSource(null);
              setHighlightIndex(0);
            }}
            onKeyDown={handleKeyDown}
            required
            className="p-3 rounded-lg bg-gray-900 border border-gray-700 text-white w-full focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          {sourceQuery && !selectedSource && filteredSources.length > 0 && (
            <ul className="absolute bg-gray-800 mt-1 w-full max-h-40 overflow-y-auto rounded-lg border border-gray-700 z-10">
              {filteredSources.map((s, idx) => (
                <li
                  key={s._id}
                  onClick={() => {
                    setSelectedSource(s);
                    setSourceQuery(s.name);
                  }}
                  className={`p-2 cursor-pointer flex items-center gap-2 hover:bg-gray-700 ${
                    idx === highlightIndex ? "bg-gray-700" : ""
                  }`}
                >
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: s.color || "#16a34a" }}
                  ></span>
                  {s.name}
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
          className="p-3 rounded-lg bg-gray-900 border border-gray-700 text-white w-24 focus:outline-none focus:ring-2 focus:ring-green-500"
        />

        {/* Date */}
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          className="p-3 rounded-lg bg-gray-900 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
        />

        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg text-white font-semibold transition"
        >
          Add
        </button>
      </form>

      {/* Incomes List */}
      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : incomes.length === 0 ? (
        <p className="text-gray-400">No incomes yet</p>
      ) : (
        <ul className="space-y-4 w-full max-w-3xl">
          {incomes.map((income) => (
            <li
              key={income._id}
              className="flex justify-between items-center p-4 rounded-xl bg-gray-900 shadow-lg hover:bg-gray-800 transition"
            >
              <div className="flex flex-col">
                <span className="font-medium text-lg">
                  {income.source?.name || "Unknown"}
                </span>
                <span className="text-gray-500 text-sm">
                  {new Date(income.date).toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-bold text-green-400 text-lg">
                  +{income.amount} ₴
                </span>
                <button
                  onClick={() => handleDelete(income._id)}
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

export default Incomes;
