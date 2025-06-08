
import React from 'react';
import { Outlet } from 'react-router-dom';
import NavBar from '../NavBar';

interface MainLayoutProps {
  children?: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-orange-50 via-white to-red-50">
      <NavBar />
      <main className="flex-1 pt-16">
        {children || <Outlet />}
      </main>
    </div>
  );
};

export default MainLayout;
