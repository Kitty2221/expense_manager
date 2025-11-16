import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config.js";
// import { ResponsiveLine } from "@nivo/line";
import { ResponsiveTimeRange } from "@nivo/calendar";

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


  const monthExpenses = expenses.filter(e => {
    const d = new Date(e.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });
    const monthIncomes = incomes.filter(i => {
    const d = new Date(i.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

//   const monthIncomes = incomes.filter(i => {
//     const d = new Date(i.date);
//     return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
//   });

  const totalExpenses = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalIncomes = monthIncomes.reduce((sum, i) => sum + i.amount, 0);
  const balance = totalIncomes - totalExpenses;

    const calendarData = [
    ...expenses.map(e => ({ day: e.date.split("T")[0], value: e.amount })),
    ...incomes.map(i => ({ day: i.date.split("T")[0], value: i.amount }))
  ];

//   const chartData = [
//     {
//       id: "Expenses",
//       color: "hsl(348, 100%, 61%)",
//       data: monthExpenses.map(e => ({ x: e.date.split("T")[0], y: e.amount })),
//     },
//     {
//       id: "Incomes",
//       color: "hsl(123, 100%, 37%)",
//       data: monthIncomes.map(i => ({ x: i.date.split("T")[0], y: i.amount })),
//
//     },
//   ];


  // Об’єднуємо expenses та incomes в один масив для календаря
  const chartData = [
    ...monthExpenses.map(e => ({
      day: e.date.split("T")[0],
      value: -e.amount, // Мінус для витрат
      type: "expense"
    })),
    ...monthIncomes.map(i => ({
      day: i.date.split("T")[0],
      value: i.amount,
      type: "income"
    }))
  ];

  // Динамічний період місяця
  const firstDay = new Date(currentYear, currentMonth, 1).toISOString().split("T")[0];
  const lastDay = new Date(currentYear, currentMonth + 1, 0).toISOString().split("T")[0];



  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="flex items-center justify-around">
      <h1 className="text-4xl font-bold text-blue-500 mb-6">💰 Dashboard</h1>
      <div className="flex mb-6">
        <button onClick={() => navigate("/expenses")} className="m-1 bg-red-600 hover:bg-white hover:text-red-600 text-white px-1 py-1 rounded-md transition">Expenses</button>
        <button onClick={() => navigate("/incomes")} className="m-1 bg-green-600 hover:bg-white hover:text-green-600 text-white px-1 py-1 rounded-md transition">Incomes</button>
        <button onClick={() => navigate("/categories")} className="m-1 bg-blue-600 hover:bg-white hover:text-blue-600 text-white px-1 py-1 rounded-md transition">Categories</button>
        <button onClick={() => navigate("/income_sources")} className="m-1 bg-pink-600 hover:bg-white hover:text-pink-600 text-white px-1 py-1 rounded-md transition">Income Sources</button>
      </div>

      </div>
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
      <div className="bg-gray-800 rounded-lg p-6 shadow mb-6" style={{ height: 500 }}>
          <ResponsiveTimeRange
            data={chartData}
            from={firstDay}
            to={lastDay}
            emptyColor="#2d2d2d"
            colors={d =>
              d.type === "income"
                ? `rgba(34, 197, 94, ${Math.min(d.value / 2000, 1)})`
                : `rgba(248, 113, 113, ${Math.min(d.value / 2000, 1)})`
            }
            dayBorderWidth={2}
            dayBorderColor="#1f2937"
            margin={{ top: 40, right: 40, bottom: 80, left: 40 }}
            direction="horizontal"
            legends={[
              {
                anchor: 'bottom-right',
                direction: 'row',
                itemCount: 2,
                itemWidth: 70,
                itemHeight: 36,
                itemsSpacing: 14,
                itemDirection: 'right-to-left',
                translateX: -40,
                translateY: -40,
                symbolSize: 20,
                itemTextColor: "#ffffff"
              }
            ]}
            tooltip={({ day, value, color, type }) => (
              <div
                style={{
                  background: "#111827",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  color: "#f9fafb",
                  fontWeight: "500",
                  fontSize: "13px"
                }}
              >
                <strong>{day}</strong> - {type === "income" ? "Income" : "Expense"}: {value} ₴
              </div>
            )}
            theme={{
              textColor: "#ffffff",
              tooltip: {
                container: {
                  background: "#1f2937",
                  color: "#ffffff",
                  fontSize: "13px",
                  borderRadius: "6px",
                  padding: "8px"
                },
              },
            }}
            daySpacing={4} // збільшуємо відстань між квадратами
            dayRadius={4}  // квадрат стає більш окресленим
          />
    </div>

// {/*        */}{/* Graph */}
// {/*       <div className="bg-gray-800 rounded-lg p-6 shadow mb-6" style={{ height: 400 }}> */}
// {/*         {loading ? ( */}
// {/*           <p>Loading chart...</p> */}
// {/*         ) : ( */}
// {/*           <ResponsiveLine */}
// {/*             data={chartData} */}
// {/*             margin={{ top: 50, right: 50, bottom: 50, left: 60 }} */}
// {/*             xScale={{ type: "point" }} */}
// {/*             yScale={{ type: "linear", min: "auto", max: "auto" }} */}
// {/*             axisBottom={{ orient: "bottom", legend: "Date", legendOffset: 36, legendPosition: "middle" }} */}
// {/*             axisLeft={{ orient: "left", legend: "Amount ₴", legendOffset: -50, legendPosition: "middle" }} */}
// {/*             colors={{ scheme: "category10" }} */}
// {/*             pointSize={8} */}
// {/*             pointColor={{ from: "color" }} */}
// {/*             pointBorderWidth={2} */}
// {/*             pointBorderColor={{ from: "serieColor" }} */}
// {/*             useMesh={true} */}
// {/*             enableSlices="x" */}
// {/*             sliceTooltip={({ slice }) => { */}
// {/*               return ( */}
// {/*                 <div className="bg-gray-900 p-2 rounded-lg shadow-lg text-white"> */}
// {/*                   {slice.points.map(point => ( */}
// {/*                     <div key={point.id}> */}
// {/*                       <strong>{point.id}: </strong>{point.data.y} ₴ */}
// {/*                     </div> */}
// {/*                   ))} */}
// {/*                 </div> */}
// {/*               ); */}
// {/*             }} */}
// {/*             theme={{ */}
// {/*               textColor: "#ffffff", */}
// {/*               axis: { */}
// {/*                 domain: { */}
// {/*                   line: { stroke: "#ffffff" }, */}
// {/*                 }, */}
// {/*                 ticks: { */}
// {/*                   line: { stroke: "#ffffff" }, */}
// {/*                   text: { fill: "#ffffff" }, */}
// {/*                 }, */}
// {/*                 legend: { */}
// {/*                   text: { fill: "#ffffff" }, */}
// {/*                 }, */}
// {/*               }, */}
// {/*               legends: { */}
// {/*                 text: { fill: "#ffffff" }, */}
// {/*               }, */}
// {/*               tooltip: { */}
// {/*                 container: { background: "#1f2937", color: "#ffffff" }, // optional: matches your dark tooltip style */}
// {/*               }, */}
// {/*             }} */}
// {/*           /> */}
// {/*         )} */}
// {/*       </div> */}

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
