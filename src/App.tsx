
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import Dashboard from './pages/Dashboard';
import Organization from './pages/Organization';
import MainLayout from './components/layouts/MainLayout';
import Interview from './pages/Interview';
import Report from './pages/Report';
import SignIn from './pages/SignIn';
import Register from './pages/Register';
import CandidateComparison from './pages/CandidateComparison';
import NotFound from './pages/NotFound';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout><Index /></MainLayout>} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<MainLayout><Dashboard /></MainLayout>} />
        <Route path="/organization" element={<MainLayout><Organization /></MainLayout>} />
        <Route path="/interview" element={<MainLayout><Interview /></MainLayout>} />
        <Route path="/report/:id" element={<MainLayout><Report /></MainLayout>} />
        <Route path="/compare/:templateId" element={<MainLayout><CandidateComparison /></MainLayout>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
