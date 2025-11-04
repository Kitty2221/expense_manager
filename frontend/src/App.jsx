import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Expenses from "./components/Expenses.jsx";
import Incomes from './components/Incomes.jsx';
import Categories from "./components/Categories.jsx";
import Dashboard from "./components/Dashboard.jsx"
import IncomeSources from "./components/IncomeSources.jsx"

function App() {
  return (
    <Router>
      <Routes>
          <Route path="/" element={<Dashboard/>}/>
          <Route path="/expenses" element={<Expenses/>}/>
          <Route path="/incomes" element={<Incomes/>}/>
          <Route path="/categories" element={<Categories/>}/>
          <Route path="/income_sources" element={<IncomeSources/>}/>
      </Routes>
    </Router>
  );
}

export default App;

