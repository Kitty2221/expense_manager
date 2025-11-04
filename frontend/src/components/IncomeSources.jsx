import {useEffect, useState} from "react";

const IncomeSources = () => {
    const [incomeSources, setIncomeSources] = useState([])
    const [newIncomeSource, setNewIncomeSource] = useState("")

    useEffect(() => {
        fetch("http://127.0.0.1:8000/income_sources/all")
        .then((res) => res.json())
        .then(setIncomeSources)
        .catch(console.error);
    }, [])

    const addIncomeSource = async () => {
        if (!newIncomeSource.trim()) return;
        const res = await fetch("http://127.0.0.1:8000/income_sources/add", {
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

  return (
    <div className="min-h-screen w-full bg-black text-white flex flex-col items-center py-10 px-4">
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
          </div>
        ))}
      </div>
    </div>
  );
}

export default IncomeSources;