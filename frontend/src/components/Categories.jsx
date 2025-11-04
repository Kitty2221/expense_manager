import { useState, useEffect } from "react";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");

  useEffect(() => {
    fetch("http://127.0.0.1:8000/categories/all")
      .then((res) => res.json())
      .then(setCategories)
      .catch(console.error);
  }, []);

  const addCategory = async () => {
    if (!newCategory.trim()) return;
    const res = await fetch("http://127.0.0.1:8000/categories/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newCategory }),
    });
    if (res.ok) {
      const added = await res.json();
      setCategories([...categories, added]);
      setNewCategory("");
    }
  };

  const handleDelete = async (id) => {
      if (!window.confirm("Delete this category?")) return;

      try {
        const res = await fetch(`http://127.0.0.1:8000/categories/${id}`, {
          method: "DELETE",
        });

        if (!res.ok) {
          const err = await res.json();
          alert(err.detail || "Error deleting category");
          return;
        }

        setCategories(categories.filter((c) => c._id !== id));
      } catch (err) {
        console.error(err);
        alert("Failed to delete category");
      }
};


 return (
    <div className="min-h-screen w-full bg-black text-white flex flex-col items-center py-10 px-4">
      <h1 className="text-4xl font-bold mb-8">📂 Categories</h1>

      <div className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="New category name..."
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          className="px-4 py-2 rounded-xl bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={addCategory}
          className="px-5 py-2 bg-blue-600 rounded-xl hover:bg-blue-500 transition-all"
        >
          ➕ Add
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 w-full max-w-4xl">
        {categories.map((c) => (
          <div
            key={c._id}
            className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex justify-between items-center hover:border-gray-600 transition-all"
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
};

export default Categories;
