import React, { useState } from 'react';
import Navbar from '../../bo-cuc/Navbar';
import Sidebar from '../../bo-cuc/Sidebar';
import Footer from '../../bo-cuc/Footer';
import type { AppStep } from '../../../assets/types';

interface DesktopLayoutProps {
  children?: React.ReactNode;
}

const DesktopLayout: React.FC<DesktopLayoutProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Desktop Sidebar - Fixed */}
      <div className={`fixed left-0 top-0 bottom-0 z-50 transition-all duration-300 ${
        sidebarCollapsed ? 'w-16' : 'w-64'
      }`}>
        <Sidebar
          activeStep={activeStep}
          setActiveStep={setActiveStep}
          completedSteps={completedSteps}
          onReset={handleReset}
          onLogout={handleLogout}
          userEmail={userEmail}
          onLoginRequest={handleLoginRequest}
          isOpen={true}
          onCollapsedChange={setSidebarCollapsed}
        />
      </div>

      {/* Desktop Navbar - Fixed */}
      <div className={`fixed top-0 right-0 z-40 transition-all duration-300 ${
        sidebarCollapsed ? 'left-16' : 'left-64'
      }`}>
        <Navbar
          userEmail={userEmail}
          onLogout={handleLogout}
          onLoginRequest={handleLoginRequest}
          onBrandClick={handleBrandClick}
          sidebarOpen={true}
          sidebarCollapsed={sidebarCollapsed}
        />
      </div>

      {/* Desktop Main Content */}
      <div className={`transition-all duration-300 ${
        sidebarCollapsed ? 'ml-16' : 'ml-64'
      } pt-14`}>
        <main className="min-h-[calc(100vh-3.5rem)] p-6">
          {/* Content Area với max-width để không quá rộng trên màn hình lớn */}
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
        
        {/* Desktop Footer */}
        <Footer />
      </div>
    </div>
  );
};

export default DesktopLayout;