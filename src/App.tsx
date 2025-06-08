
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Features from './pages/Features';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import ProfileSetup from './pages/candidate/ProfileSetup';
import MockInterview from './pages/candidate/MockInterview';
import Interview from './pages/Interview';
import NotFound from './pages/NotFound';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/features" element={<Features />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/candidate-signup" element={<Signup />} />
        <Route path="/organization-signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/candidate/dashboard" element={<Dashboard />} />
        <Route path="/candidate/profile-setup" element={<ProfileSetup />} />
        <Route path="/candidate/mock-interview" element={<MockInterview />} />
        <Route path="/candidate/interview" element={<Interview />} />
        <Route path="/interview" element={<Interview />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
