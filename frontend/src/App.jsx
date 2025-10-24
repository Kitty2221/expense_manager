import { useEffect, useState } from "react";

function App() {
  const [incomes, setIncomes] = useState([]);
  const [amount, setAmount] = useState("");
  const [source, setSource] = useState("");
  const [loading, setLoading] = useState(false);


  // ✅ Отримуємо всі доходи при завантаженні сторінки
  useEffect(() => {
    fetchIncomes();
  }, []);

  const fetchIncomes = async () => {
    setLoading(true);
    const response = await fetch("http://127.0.0.1:8000/incomes/all");
    const data = await response.json();
    setIncomes(data);
    setLoading(false);
  };

  // ✅ Додаємо новий дохід
  const addIncome = async (e) => {
    e.preventDefault();
    const payload = {
      date: new Date().toISOString(),
      amount: parseFloat(amount),
      source,
    };

    const response = await fetch("http://127.0.0.1:8000/incomes/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      setAmount("");
      setSource("");
      fetchIncomes();
    } else {
      alert("Помилка при додаванні доходу");
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "50px auto", fontFamily: "sans-serif" }}>
      <h1>💰 Мої доходи</h1>

      <form onSubmit={addIncome} style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Джерело"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Сума"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
        <button type="submit">Додати</button>
      </form>

      {loading ? (
        <p>Завантаження...</p>
      ) : incomes.length === 0 ? (
        <p>Немає доходів</p>
      ) : (
        <ul>
          {incomes.map((income) => (
            <li key={income._id || income.id}>
              <strong>{income.source}</strong>: {income.amount} грн
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;
