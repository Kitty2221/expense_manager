// // src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Expenses from "./components/Expenses.jsx";
import Incomes from './components/Incomes.jsx';
import Categories from "./components/Categories.jsx";
function App() {
  return (

    <Router>
      <Routes>
          <Route path="/" element={
              <div className="min-h-screen flex items-center bg-black flex-col items-center text-3xl">
                  <p className="text-red-300">
                      <h1>Welcome to expense manager app! 💅</h1>
                  </p>
              </div>

          }/>
          <Route path="/expenses" element={<Expenses/>}/>
          <Route path="/incomes" element={<Incomes/>}/>
          <Route path="/categories" element={<Categories/>}/>
      </Routes>
    </Router>
  );
}

export default App;

