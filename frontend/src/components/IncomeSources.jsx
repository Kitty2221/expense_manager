import {useEffect, useState} from "react";
import { API_BASE_URL } from "../config.js";
import { useNavigate } from "react-router-dom";

const IncomeSources = () => {
    const [incomeSources, setIncomeSources] = useState([])
    const [newIncomeSource, setNewIncomeSource] = useState("")

    useEffect(() => {
        fetch(`${API_BASE_URL}/income_sources/all`)
        .then((res) => res.json())
        .then(setIncomeSources)
        .catch(console.error);
    }, [])

    const addIncomeSource = async () => {
        if (!newIncomeSource.trim()) return;
        const res = await fetch(`${API_BASE_URL}/income_sources/add`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: newIncomeSource }),
        });
        if (res.ok) {
          const added = await res.json();
          setIncomeSources([...incomeSources, added]);
          setNewIncomeSource("");
        }
  };
    const handleDelete = async (id) => {
      if (!window.confirm("Delete this income source?")) return;

      try {
        const res = await fetch(`${API_BASE_URL}/income_sources/${id}`, {
          method: "DELETE",
        });

        if (!res.ok) {
          const err = await res.json();
          alert(err.detail || "Error deleting income source");
          return;
        }

        setIncomeSources(incomeSources.filter((c) => c._id !== id));
      } catch (err) {
        console.error(err);
        alert("Failed to delete income sources");
      }
    };
    const navigate = useNavigate()

  return (
    <div className="min-h-screen w-full bg-black text-white flex flex-col items-center py-10 px-4">
      <button onClick={() => navigate("/")} className="m-1 bg-pink-600 hover:bg-white hover:text-pink-600 text-white px-1 py-1 rounded-md transition">Dashboard</button>
      <h1 className="text-4xl font-bold mb-8">📂 Income Sources</h1>

      <div className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="New income source name..."
          value={newIncomeSource}
          onChange={(e) => setNewIncomeSource(e.target.value)}
          className="px-4 py-2 rounded-xl bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={addIncomeSource}
          className="px-5 py-2 bg-blue-600 rounded-xl hover:bg-blue-500 transition-all"
        >
          ➕ Add
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 w-full max-w-4xl">
        {incomeSources.map((c) => (
          <div
            key={c._id}
            className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex justify-between items-center"
          >
            <span className="text-lg">{c.name}</span>
            <button
              onClick={() => handleDelete(c._id)}
              className="text-red-500 hover:text-red-400 transition-all text-xl"
            >
              ❌
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default IncomeSources;