import React, { useState } from 'react';
import Navbar from '../../bo-cuc/Navbar';
import Sidebar from '../../bo-cuc/Sidebar';
import Footer from '../../bo-cuc/Footer';
import type { AppStep } from '../../../assets/types';

interface TabletLayoutProps {
  children?: React.ReactNode;
}

const TabletLayout: React.FC<TabletLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeStep, setActiveStep] = useState<AppStep>('home');
  const [completedSteps, setCompletedSteps] = useState<AppStep[]>([]);
  const [userEmail, setUserEmail] = useState<string>('');
  
  const handleReset = () => {
    setActiveStep('home');
    setCompletedSteps([]);
  };

  const handleLogout = () => {
    setUserEmail('');
    setActiveStep('home');
    setCompletedSteps([]);
  };

  const handleLoginRequest = () => {
    // Handle login logic
  };

  const handleBrandClick = () => {
    setActiveStep('home');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative">
      {/* Tablet Sidebar - Overlay style */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <Sidebar
          activeStep={activeStep}
          setActiveStep={setActiveStep}
          completedSteps={completedSteps}
          onReset={handleReset}
          onLogout={handleLogout}
          userEmail={userEmail}
          onLoginRequest={handleLoginRequest}
          isOpen={sidebarOpen}
          onClose={closeSidebar}
        />
      </div>

      {/* Sidebar Backdrop for tablet */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={closeSidebar}
        />
      )}

      {/* Tablet Navbar - Full width */}
      <div className="fixed top-0 left-0 right-0 z-30">
        <Navbar
          userEmail={userEmail}
          onLogout={handleLogout}
          onLoginRequest={handleLoginRequest}
          onBrandClick={handleBrandClick}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={toggleSidebar}
          sidebarCollapsed={false}
        />
      </div>

      {/* Tablet Main Content */}
      <div className="pt-14">
        <main className="min-h-[calc(100vh-3.5rem)] p-4 tablet-main">
          {/* Content optimized for tablet touch */}
          <div className="max-w-5xl mx-auto">
            {children}
          </div>
        </main>
        
        {/* Tablet Footer */}
        <Footer />
      </div>
    </div>
  );
};

export default TabletLayout;