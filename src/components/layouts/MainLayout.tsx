
import React from 'react';
import { Outlet } from 'react-router-dom';
import NavBar from '../NavBar';

interface MainLayoutProps {
  children?: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <NavBar />
      <main className="flex-1 page-transition pt-16"> {/* Added pt-16 for navbar height */}
        {children || <Outlet />}
      </main>
    </div>
  );
};

export default MainLayout;
