import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AddLuggage from "./pages/AddLuggage";
import LuggageDetails from "./pages/LuggageDetails";
import { AuthProvider } from "./contexts/AuthContext";
import "./index.css"; // Or the CSS file you added Tailwind to

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-green-50">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/add-luggage" element={<AddLuggage />} />
              <Route path="/luggage/:id" element={<LuggageDetails />} />
            </Routes>
          </main>
          <Toaster position="top-right" />
        </div>
      </Router>
    </AuthProvider>
  );
  //export default App;
}
export default App;
