import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import './App.css'
import LoginForm from './components/LoginForm'
import Dashboard from './components/Dashboard'
import SignupForm from './components/SignupForm'
import AdminDashboard from "./components/AdminDashboard";



function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/signup" element={<SignupForm />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </>
  )
}

export default App
