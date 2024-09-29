import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import SignInSignUp from "./components/SignInSignUp";  // Nome correto do componente combinado
import ChatPage from "./components/ChatPage";
import ProfilePage from "./components/ProfilePage";

function App() {
  return (
    <Router>
      <Routes>
        {/* Rota para Login e Registro (combinado no mesmo componente) */}
        <Route path="/login" element={<SignInSignUp />} />

        {/* Rota para a página de Chat */}
        <Route path="/chat" element={<ChatPage />} />

        {/* Redireciona para a página de login caso a rota não exista */}
        <Route path="*" element={<Navigate to="/login" />} />

        <Route path = "/profile" element={<ProfilePage />} />

        
      </Routes>
    </Router>
  );
}

export default App;
