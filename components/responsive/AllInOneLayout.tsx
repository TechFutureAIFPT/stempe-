import React, { useState } from 'react';
import { useDeviceDetection } from './useDeviceDetection';
import Navbar from '../bo-cuc/Navbar';
import Sidebar from '../bo-cuc/Sidebar';
import Footer from '../bo-cuc/Footer';
import type { AppStep } from '../../assets/types';

interface ResponsiveLayoutProps {
  children?: React.ReactNode;
}

// Desktop Layout Component
const DesktopLayoutComponent: React.FC<ResponsiveLayoutProps> = ({ children }) => {
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

// Tablet Layout Component
const TabletLayoutComponent: React.FC<ResponsiveLayoutProps> = ({ children }) => {
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

// Mobile Layout Component
const MobileLayoutComponent: React.FC<ResponsiveLayoutProps> = ({ children }) => {
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
    setSidebarOpen(false);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative">
      {/* Mobile Sidebar - Full screen overlay */}
      <div className={`fixed inset-0 z-50 transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } md:hidden`}>
        <div className="flex h-full">
          {/* Sidebar content */}
          <div className="w-64 bg-slate-900 border-r border-slate-700">
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
          
          {/* Backdrop area */}
          <div 
            className="flex-1 bg-black/50 backdrop-blur-sm"
            onClick={closeSidebar}
          />
        </div>
      </div>

      {/* Mobile Navbar - Sticky */}
      <div className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-lg border-b border-slate-700 mobile-nav">
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

      {/* Mobile Main Content */}
      <div className="mobile-main">
        <main className="min-h-screen p-4 pb-20">
          {/* Mobile-optimized content container */}
          <div className="max-w-full">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation - Fixed */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-slate-900/95 backdrop-blur-lg border-t border-slate-700 mobile-bottom-nav">
        <div className="flex justify-around items-center h-16 px-2">
          <button 
            onClick={() => setActiveStep('home')}
            className={`flex flex-col items-center justify-center flex-1 h-full rounded-lg transition-colors ${
              activeStep === 'home' 
                ? 'text-cyan-400 bg-cyan-500/10' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <i className="fas fa-home text-lg mb-1"></i>
            <span className="text-xs font-medium">Trang chủ</span>
          </button>
          
          <button 
            onClick={() => setActiveStep('jd')}
            className={`flex flex-col items-center justify-center flex-1 h-full rounded-lg transition-colors ${
              activeStep === 'jd' 
                ? 'text-cyan-400 bg-cyan-500/10' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <i className="fas fa-file-text text-lg mb-1"></i>
            <span className="text-xs font-medium">Công việc</span>
          </button>
          
          <button 
            onClick={() => setActiveStep('upload')}
            className={`flex flex-col items-center justify-center flex-1 h-full rounded-lg transition-colors ${
              activeStep === 'upload' 
                ? 'text-cyan-400 bg-cyan-500/10' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <i className="fas fa-upload text-lg mb-1"></i>
            <span className="text-xs font-medium">Tải CV</span>
          </button>
          
          <button 
            onClick={() => setActiveStep('analysis')}
            className={`flex flex-col items-center justify-center flex-1 h-full rounded-lg transition-colors ${
              activeStep === 'analysis' 
                ? 'text-cyan-400 bg-cyan-500/10' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <i className="fas fa-chart-line text-lg mb-1"></i>
            <span className="text-xs font-medium">Phân tích</span>
          </button>
          
          <button 
            onClick={toggleSidebar}
            className="flex flex-col items-center justify-center flex-1 h-full rounded-lg transition-colors text-slate-400 hover:text-slate-200"
          >
            <i className="fas fa-bars text-lg mb-1"></i>
            <span className="text-xs font-medium">Menu</span>
          </button>
        </div>
      </div>

      {/* Mobile Footer - Only visible when not at bottom */}
      <div className="mobile-footer">
        <Footer />
      </div>
    </div>
  );
};

// Main ResponsiveLayout Component
const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({ children }) => {
  const device = useDeviceDetection();
  
  // Add loading state để tránh flash khi switch layout
  const [isLoaded, setIsLoaded] = React.useState(false);
  
  React.useEffect(() => {
    setIsLoaded(true);
  }, []);

  if (!isLoaded) {
    return (
      <div className="fixed inset-0 bg-slate-950 flex items-center justify-center z-50">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white text-lg">Đang tải giao diện...</p>
        </div>
      </div>
    );
  }

  // Debug info (chỉ hiển thị trong development)
  const showDebugInfo = typeof window !== 'undefined' && window.location.hostname === 'localhost';

  return (
    <>
      {showDebugInfo && (
        <div className="fixed top-2 right-2 bg-black/80 text-white p-2 rounded text-xs z-[100] font-mono">
          {device.type} - {device.width}x{device.height}
        </div>
      )}
      
      {device.isDesktop && <DesktopLayoutComponent>{children}</DesktopLayoutComponent>}
      {device.isTablet && <TabletLayoutComponent>{children}</TabletLayoutComponent>}
      {device.isMobile && <MobileLayoutComponent>{children}</MobileLayoutComponent>}
    </>
  );
};

export default ResponsiveLayout;