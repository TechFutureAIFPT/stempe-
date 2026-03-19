import React, { useState, useCallback, useMemo, useEffect, useRef, Suspense, lazy } from 'react';
import { detectIndustryFromJD } from './services/ai-va-ml/industryDetector';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './src/firebase';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Analytics } from '@vercel/analytics/react';
import WebVitalsReporter from './components/giao-dien/bieu-do-va-thong-ke/WebVitalsReporter';
import BundleAnalyzer from './components/giao-dien/bieu-do-va-thong-ke/BundleAnalyzer';

import { UserProfileService } from './services/du-lieu-va-sync/userProfileService';
import type { AppStep, Candidate, HardFilters, WeightCriteria, AnalysisRunData } from './assets/types';
import { initialWeights } from './assets/constants';
import Sidebar from './components/bo-cuc/Sidebar';
import Footer from './components/bo-cuc/Footer';
import ProgressBar from './components/giao-dien/co-ban/ProgressBar';
import JDTemplatesModal, { JDTemplate } from './components/giao-dien/lich-su-va-cache/JDTemplatesModal';
import HistoryModal from './components/giao-dien/lich-su-va-cache/HistoryModal';
import PageTransition from './components/ui/PageTransition';

// Lazy load pages for code-splitting
const ScreenerPage = lazy(() => import('./components/trang/chinh/ScreenerPage'));
const ProcessPage = lazy(() => import('./components/trang/chinh/ProcessPage'));
const HomePage = lazy(() => import('./HomePage'));
const AchievementsContactPage = lazy(() => import('./components/trang/thong-tin/AchievementsContactPage'));
const DeploymentReadyPage = lazy(() => import('./components/trang/trien-khai/DeploymentReadyPage'));
const LoginPage = lazy(() => import('./components/trang/xac-thuc/LoginPage'));
const DetailedAnalyticsPage = lazy(() => import('./components/trang/phan-tich/DetailedAnalyticsPage'));
const PrivacyPolicyPage = lazy(() => import('./components/trang/thong-tin/PrivacyPolicyPage'));
const TermsPage = lazy(() => import('./components/trang/thong-tin/TermsPage'));
const ParseJDPage = lazy(() => import('./components/trang/cong-cu/ParseJDPage'));
import CandidateSuggestions from './components/trang/phan-tich/CandidateSuggestions';
// HistoryPage removed from UI (still saving to Firestore silently)
import { saveHistorySession } from './services/lich-su-va-cache/historyService';
import { cvFilterHistoryService } from './services/lich-su-va-cache/analysisHistory';
 
function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);
  useEffect(() => {
    ref.current = value;
  }); 
  return ref.current;
}

const App = () => {
  return (
    <BrowserRouter>
      <MainApp />
    </BrowserRouter>
  );
};

const MainApp = () => {
  // Initialize state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [resetKey, setResetKey] = useState(Date.now());
  const [isInitializing, setIsInitializing] = useState(true);
  
  const handleLogin = async (email: string) => {
    // The actual authentication is handled by Firebase in LoginPage
    // This is just for UI state management
    setShowLoginModal(false);
  };
  
  const handleFullReset = () => {
    setResetKey(Date.now());
  };

  const handleLoginRequest = () => {
    setShowLoginModal(true);
  };

  // Listen for Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      setCurrentUser(user);
      setIsLoggedIn(!!user);
      
      if (user) {
        // Sync localStorage authEmail with Firebase auth
        localStorage.setItem('authEmail', user.email || '');
        
        try {
          // Save/update user profile in Firestore
          await UserProfileService.saveUserProfile(
            user.uid,
            user.email!,
            user.displayName || undefined
          );
          
          // Migrate local data to Firebase if needed
          await UserProfileService.migrateLocalDataToFirebase(user.uid, user.email!);
        } catch (error) {
          console.error('Error syncing user profile:', error);
        }
      } else {
        // Clear localStorage when logged out
        localStorage.removeItem('authEmail');
      }
      
      setIsInitializing(false);
    });

    return () => unsubscribe();
  }, []);

  // Fallback to localStorage for compatibility with existing code
  useEffect(() => {
    if (!isInitializing && !currentUser) {
      const syncLoginState = () => {
        try {
          const authEmail = localStorage.getItem('authEmail') || '';
          const wasLoggedIn = !!(authEmail && authEmail.length > 0);
          if (wasLoggedIn && !isLoggedIn) {
            setIsLoggedIn(wasLoggedIn);
          }
        } catch {}
      };
      
      syncLoginState();
      window.addEventListener('storage', syncLoginState);
      const interval = setInterval(syncLoginState, 5000);
      
      return () => {
        window.removeEventListener('storage', syncLoginState);
        clearInterval(interval);
      };
    }
  }, [isInitializing, currentUser, isLoggedIn]);

  return (
    <>
      <PageTransition />
      <MainLayout
        onResetRequest={handleFullReset}
        isLoggedIn={isLoggedIn}
        onLoginRequest={handleLoginRequest}
        currentUser={currentUser}
      />
      {showLoginModal && (
        <div className="fixed inset-0 z-50">
          <button
            onClick={() => setShowLoginModal(false)}
            className="absolute top-4 right-4 w-12 h-12 bg-slate-800/80 backdrop-blur-sm border border-slate-600 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-500 transition-colors z-10"
          >
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
          <LoginPage onLogin={handleLogin} />
        </div>
      )}
    </>
  );
};


interface MainLayoutProps {
  onResetRequest: () => void;
  className?: string;
  isLoggedIn: boolean;
  onLoginRequest: () => void;
  currentUser: User | null;
}

const MainLayout = ({ onResetRequest, className, isLoggedIn, onLoginRequest, currentUser }: MainLayoutProps) => {
  const [userEmail, setUserEmail] = useState<string>(() => {
    // attempt to get from auth current user if available
    return (typeof window !== 'undefined' && (window as any).localStorage?.getItem('authEmail')) || '';
  });
  const [completedSteps, setCompletedSteps] = useState<AppStep[]>([]);
  const [jdTemplatesModalOpen, setJdTemplatesModalOpen] = useState<boolean>(false);
  const [historyModalOpen, setHistoryModalOpen] = useState<boolean>(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebarCollapsed');
      return saved ? JSON.parse(saved) : false;
    }
    return false;
  });
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    // Mặc định luôn mở sidebar
    const saved = localStorage.getItem('sidebarOpen');
    
    // Nếu đã có trạng thái đã lưu, sử dụng nó
    if (saved !== null) {
      return JSON.parse(saved);
    }
    
    // Mặc định: luôn mở
    return true;
  });
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');

  // Load avatar and user name for mobile navbar
  useEffect(() => {
    const loadUserData = async () => {
      if (currentUser) {
        if (currentUser.displayName) {
          setUserName(currentUser.displayName);
        } else if (currentUser.email) {
          setUserName(currentUser.email.split('@')[0]);
        }

        if (currentUser.photoURL) {
          setUserAvatar(currentUser.photoURL);
        } else {
          try {
            const profile = await UserProfileService.getUserProfile(currentUser.uid);
            if (profile?.avatar) {
              setUserAvatar(profile.avatar);
            } else if (currentUser.email) {
              setUserAvatar(localStorage.getItem(`avatar_${currentUser.email}`));
            }
          } catch {
            if (currentUser.email) setUserAvatar(localStorage.getItem(`avatar_${currentUser.email}`));
          }
        }
      } else if (userEmail) {
         setUserName(userEmail.split('@')[0]);
         setUserAvatar(localStorage.getItem(`avatar_${userEmail}`));
      }
    };
    loadUserData();
  }, [currentUser, userEmail]);
  const location = useLocation();
  const navigate = useNavigate();
  const handleLogout = useCallback(async () => {
    try {
      await auth.signOut();
      localStorage.removeItem('authEmail');
      localStorage.removeItem('googleDriveToken');
      // Navigate to home before potentially reloading or just let auth state handle it
      navigate('/');
      // Instead of reload, we can let onAuthStateChanged handle the UI update
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback
      localStorage.removeItem('authEmail');
      localStorage.removeItem('googleDriveToken');
      window.location.href = '/';
    }
  }, [navigate]);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => {
      const newState = !prev;
      localStorage.setItem('sidebarOpen', JSON.stringify(newState));
      return newState;
    });
  }, []);

  // Theo dõi thay đổi kích thước màn hình để tự động đóng sidebar trên mobile
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        setSidebarOpen(false);
      }
    };

    // Chỉ thêm listener nếu đang ở browser
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  }, []);
  const [jdText, setJdText] = useState<string>('');
  const [jobPosition, setJobPosition] = useState<string>('');
  const [weights, setWeights] = useState<WeightCriteria>(initialWeights);
  const [hardFilters, setHardFilters] = useState<HardFilters>({
    location: '',
    minExp: '',
    seniority: '',
    education: '',
      industry: '',
    language: '',
    languageLevel: '',
    certificates: '',
    salaryMin: '',
    salaryMax: '',
    workFormat: '',
    contractType: '',
    locationMandatory: true,
    minExpMandatory: true,
    seniorityMandatory: true,
    educationMandatory: false,
    contactMandatory: false,
    industryMandatory: true,
    languageMandatory: false,
    certificatesMandatory: false,
    salaryMandatory: false,
    workFormatMandatory: false,
    contractTypeMandatory: false,
  });
  const [cvFiles, setCvFiles] = useState<File[]>([]);
  const [analysisResults, setAnalysisResults] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');

  
  // Đồng bộ lại email nếu ban đầu rỗng hoặc thay đổi ở tab khác
  useEffect(() => {
    const syncEmail = () => {
      try {
        const stored = localStorage.getItem('authEmail') || '';
        setUserEmail(prev => (prev && prev.length > 0) ? prev : stored);
      } catch {}
    };
    syncEmail();
    window.addEventListener('storage', syncEmail);
    const interval = setInterval(syncEmail, 5000); // phòng trường hợp storage event không bắn
    return () => {
      window.removeEventListener('storage', syncEmail);
      clearInterval(interval);
    };
  }, []);


  

  const handleRestore = useCallback((payload: any) => {
    if (!payload) return;
    try {
      setJdText(payload.jdText || '');
      setJobPosition(payload.jobPosition || '');
      if (payload.weights) setWeights(payload.weights);
      if (payload.hardFilters) setHardFilters(payload.hardFilters);
      if (payload.candidates) setAnalysisResults(payload.candidates);
      setCompletedSteps(['jd','weights','upload','analysis']);
      navigate('/analysis');
    } catch (e) {
      console.warn('Restore failed', e);
    }
  }, [navigate]);
  

  const prevIsLoading = usePrevious(isLoading);

  // Auto-detect industry from JD whenever jdText changes significantly (throttle by length change)
  useEffect(() => {
    if (!jdText || jdText.length < 80) return; // avoid too-early detection
    setHardFilters(prev => {
      // If user already typed a custom industry different from last detected one, don't overwrite
      if (prev.industry && prev.industryManual) return prev; // industryManual is now in interface
      const detected = detectIndustryFromJD(jdText);
      if (detected && detected !== prev.industry) {
        return { ...prev, industry: detected };
      }
      return prev;
    });
  }, [jdText]);

  // Mark manual edits to industry (listener could be added where HardFilterPanel handles changes)
  // Quick patch: wrap original setHardFilters to flag manual change when id==='industry'
  const originalSetHardFilters = setHardFilters;
  const setHardFiltersWithFlag: typeof setHardFilters = (update) => {
    if (typeof update === 'function') {
      originalSetHardFilters(prev => {
        const next = (update as any)(prev);
        if (next.industry !== prev.industry && next._lastIndustryAuto !== true) {
          (next as any).industryManual = true;
        }
        return next;
      });
    } else {
      if (update.industry !== (hardFilters as any).industry) (update as any).industryManual = true;
      originalSetHardFilters(update);
    }
  };

  useEffect(() => {
    if (prevIsLoading && !isLoading && analysisResults.length > 0) {
      const successfulCandidates = analysisResults.filter(c => c.status === 'SUCCESS');
      if (successfulCandidates.length > 0) {
        // Add unique IDs to candidates before saving
        const candidatesWithIds = successfulCandidates.map(c => ({
          ...c,
          id: c.id || `${c.fileName}-${c.candidateName}-${Math.random()}`
        }));

        const analysisRun: AnalysisRunData = {
          timestamp: Date.now(),
          job: {
            position: jobPosition,
            locationRequirement: hardFilters.location || 'Không có',
          },
          candidates: candidatesWithIds,
        };
        localStorage.setItem('cvAnalysis.latest', JSON.stringify(analysisRun));
        
        // Save to CV filter history (always enabled)
        try {
          cvFilterHistoryService.addFilterSession(
            jobPosition || 'Không rõ vị trí'
          );
        } catch (error) {
          console.warn('Failed to save filter history:', error);
        }
        
        // Firestore persistence (best-effort)
        saveHistorySession({
          jdText,
          jobPosition,
          locationRequirement: hardFilters.location || 'Không có',
          candidates: candidatesWithIds,
          userEmail: userEmail || 'anonymous',
          weights,
          hardFilters,
        }).catch(err => console.warn('Save history failed', err));
      }
    }
  }, [isLoading, prevIsLoading, analysisResults, jobPosition, hardFilters.location, jdText, userEmail, weights, hardFilters]);

  const activeStep = useMemo((): AppStep => {
    switch(location.pathname) {
      case '/process': return 'process';
      case '/jd': return 'jd';
      case '/weights': return 'weights';
      case '/upload': return 'upload';
      case '/analysis': return 'analysis';
      case '/dashboard': return 'dashboard';
      case '/detailed-analytics': return 'dashboard'; // Show dashboard as active for detailed analytics page
      case '/chatbot': return 'chatbot';
      case '/':
      default:
        return 'home';
    }
  }, [location.pathname]);

  const setActiveStep = useCallback((step: AppStep) => {
    const pathMap: Partial<Record<AppStep, string>> = {
      home: '/',
      jd: '/jd',
      weights: '/weights',
      upload: '/upload',
      analysis: '/analysis',
      dashboard: '/detailed-analytics',
      chatbot: '/chatbot',
      process: '/process'
    };
    if (pathMap[step]) navigate(pathMap[step]!);
  }, [navigate]);

  const markStepAsCompleted = useCallback((step: AppStep) => {
    setCompletedSteps(prev => [...new Set([...prev, step])]);
  }, []);

  const isHomeView = activeStep === 'home';

  useEffect(() => {
    const path = location.pathname;
    const requiresJD = ['/weights', '/upload', '/analysis'];
    if (requiresJD.includes(path) && !completedSteps.includes('jd')) {
      navigate('/jd', { replace: true });
      return;
    }
    if (path === '/upload' && !completedSteps.includes('weights')) {
      navigate('/jd', { replace: true });
      return;
    }
    if (path === '/analysis' && (!completedSteps.includes('weights') || !completedSteps.includes('upload'))) {
      navigate('/jd', { replace: true });
    }
  }, [location.pathname, completedSteps, navigate]);



  const screenerPageProps = {
    jdText, setJdText,
    jobPosition, setJobPosition,
    weights, setWeights,
    hardFilters, setHardFilters,
    cvFiles, setCvFiles,
    analysisResults, setAnalysisResults,
    isLoading, setIsLoading,
    loadingMessage, setLoadingMessage,
    activeStep, setActiveStep,
    completedSteps, markStepAsCompleted,
  };

  return (
     <div className={`min-h-screen text-slate-200 flex flex-col overflow-x-hidden ${className || ''}`}>
      {!isHomeView && (
        <Sidebar 
          activeStep={activeStep} 
          setActiveStep={setActiveStep} 
          completedSteps={completedSteps}
          onReset={onResetRequest}
          onLogout={handleLogout}
          userEmail={userEmail}
          onLoginRequest={onLoginRequest}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onShowSettings={() => setJdTemplatesModalOpen(true)}
          onShowHistory={() => setHistoryModalOpen(true)}
          onCollapsedChange={setSidebarCollapsed}
        />
      )}
      
      {/* Mobile Fixed Navbar */}
      {!isHomeView && (
        <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-[#0B1120] border-b border-slate-800 z-40 flex items-center justify-between px-4 shadow-md">
          {/* Left: Hamburger & Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSidebar}
              className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-white"
            >
              <i className="fa-solid fa-bars text-xl"></i>
            </button>

            <div className="flex items-center gap-2">
               <img src="/images/logos/logo.jpg" alt="Logo" className="w-8 h-8 rounded-lg object-contain" />
               <span className="font-bold text-white text-sm">Support HR</span>
            </div>
          </div>

          {/* Right: Avatar */}
          <div className="relative">
             <button 
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 overflow-hidden focus:outline-none focus:ring-2 focus:ring-cyan-500"
             >
                {userAvatar ? (
                  <img src={userAvatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white bg-gradient-to-br from-cyan-500 to-blue-600">
                     {userEmail ? userEmail.charAt(0).toUpperCase() : <i className="fa-solid fa-user"></i>}
                  </div>
                )}
             </button>

             {/* Mobile Menu Dropdown */}
             {showMobileMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowMobileMenu(false)}></div>
                  <div className="absolute right-0 top-full mt-2 w-48 bg-[#0f172a] border border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-700 bg-slate-800/50">
                      <p className="text-sm font-bold text-white truncate">{userName || (userEmail ? userEmail.split('@')[0] : 'User')}</p>
                      <p className="text-xs text-slate-400 truncate">{userEmail}</p>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setShowMobileMenu(false);
                          setJdTemplatesModalOpen(true);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2"
                      >
                        <i className="fa-solid fa-file-invoice"></i> Mẫu JD
                      </button>
                      <button
                        onClick={() => {
                          setShowMobileMenu(false);
                          setHistoryModalOpen(true);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2"
                      >
                        <i className="fa-solid fa-clock-rotate-left"></i> Lịch sử
                      </button>
                      <button
                        onClick={() => {
                          setShowMobileMenu(false);
                          handleLogout();
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                      >
                        <i className="fa-solid fa-right-from-bracket"></i> Đăng xuất
                      </button>
                    </div>
                  </div>
                </>
             )}
          </div>
        </header>
      )}
      
      <main className={`main-content ml-0 ${!isHomeView ? 'mt-14 md:mt-0' : ''} ${!isHomeView ? (sidebarCollapsed ? 'md:ml-20' : 'md:ml-64') : 'md:ml-0'} flex-1 flex flex-col min-h-0 overflow-x-hidden transition-all duration-300 ease-in-out ${!isHomeView ? (sidebarCollapsed ? 'md:w-[calc(100vw-5rem)]' : 'md:w-[calc(100vw-16rem)]') : 'md:w-full'}`}>
        {activeStep !== 'home' && activeStep !== 'jd' && activeStep !== 'weights' && activeStep !== 'upload' && activeStep !== 'analysis' && activeStep !== 'dashboard' && (
          <div className="pt-4">
            <ProgressBar activeStep={activeStep} completedSteps={completedSteps} />
          </div>
        )}
        <div className={`w-full overflow-x-hidden ${(activeStep === 'home' || activeStep === 'jd' || activeStep === 'weights' || activeStep === 'upload' || activeStep === 'analysis' || activeStep === 'dashboard' || activeStep === 'chatbot') ? 'flex-1' : 'max-w-7xl px-4 sm:px-6 lg:px-8 mx-auto py-2'} ${(activeStep === 'home' || activeStep === 'jd' || activeStep === 'weights' || activeStep === 'upload' || activeStep === 'analysis' || activeStep === 'dashboard' || activeStep === 'chatbot') ? '' : 'py-2'} flex-1`}>
          <Suspense fallback={<div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>}>
            <Routes>
              <Route path="/" element={<HomePage setActiveStep={setActiveStep} isLoggedIn={isLoggedIn} onLoginRequest={onLoginRequest} completedSteps={completedSteps} />} />
              <Route path="/jd" element={isLoggedIn ? <ScreenerPage {...screenerPageProps} /> : <HomePage setActiveStep={setActiveStep} isLoggedIn={isLoggedIn} onLoginRequest={onLoginRequest} completedSteps={completedSteps} />} />
              <Route path="/weights" element={isLoggedIn ? <ScreenerPage {...screenerPageProps} /> : <HomePage setActiveStep={setActiveStep} isLoggedIn={isLoggedIn} onLoginRequest={onLoginRequest} completedSteps={completedSteps} />} />
              <Route path="/upload" element={isLoggedIn ? <ScreenerPage {...screenerPageProps} /> : <HomePage setActiveStep={setActiveStep} isLoggedIn={isLoggedIn} onLoginRequest={onLoginRequest} completedSteps={completedSteps} />} />
              <Route path="/analysis" element={isLoggedIn ? <ScreenerPage {...screenerPageProps} /> : <HomePage setActiveStep={setActiveStep} isLoggedIn={isLoggedIn} onLoginRequest={onLoginRequest} completedSteps={completedSteps} />} />

              <Route path="/detailed-analytics" element={isLoggedIn ? <DetailedAnalyticsPage candidates={analysisResults} jobPosition={jobPosition} onReset={onResetRequest} /> : <HomePage setActiveStep={setActiveStep} isLoggedIn={isLoggedIn} onLoginRequest={onLoginRequest} completedSteps={completedSteps} />} />
              <Route path="/chatbot" element={isLoggedIn ? <CandidateSuggestions candidates={analysisResults} jobPosition={jobPosition} /> : <HomePage setActiveStep={setActiveStep} isLoggedIn={isLoggedIn} onLoginRequest={onLoginRequest} completedSteps={completedSteps} />} />
              <Route path="/parse-jd" element={<ParseJDPage />} />
              <Route path="/process" element={<ProcessPage />} />
              <Route path="/contact-ready" element={<DeploymentReadyPage />} />
              <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
              <Route path="/terms" element={<TermsPage />} />
            </Routes>
          </Suspense>
        </div>
        {/* Footer chỉ hiển thị ở trang chủ */}
        {activeStep === 'home' && <Footer />}
      </main>
      
      {/* JD Templates Modal */}
      <JDTemplatesModal
        isOpen={jdTemplatesModalOpen}
        onClose={() => setJdTemplatesModalOpen(false)}
        onSelectTemplate={(template: JDTemplate) => {
          setJdText(template.jdText);
          setJobPosition(template.jobPosition);
          setHardFilters({
            ...hardFilters,
            ...template.hardFilters
          });
          markStepAsCompleted('jd');
          markStepAsCompleted('weights');
          setActiveStep('upload');
        }}
      />
      
      {/* History Modal */}
      <HistoryModal
        isOpen={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
      />
      
      {/* Vercel Analytics & Speed Insights for performance monitoring */}
      <Analytics />
      <SpeedInsights />
      <WebVitalsReporter />
      {/* <BundleAnalyzer /> */}
    </div>
  );
};  

export default App;
