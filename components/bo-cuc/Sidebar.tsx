import React, { useState } from 'react';
import { Home, FileText, Sliders, Upload, Sparkles, History, ChevronLeft, ChevronRight, PieChart, Bot } from 'lucide-react';
import type { AppStep, HistoryEntry } from '../../assets/types';

interface SidebarProps {
  activeStep: AppStep;
  setActiveStep: (step: AppStep) => void;
  completedSteps: AppStep[];
  onReset: () => void;
  onLogout?: () => void;
  userEmail?: string;
  onLoginRequest?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
  onShowSettings?: () => void;
  onShowHistory?: () => void;
  onCollapsedChange?: (collapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeStep, setActiveStep, completedSteps, onReset, onLogout, userEmail, onLoginRequest, isOpen = true, onClose, onShowSettings, onShowHistory, onCollapsedChange }) => {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebarCollapsed');
      return saved ? JSON.parse(saved) : false;
    }
    return false;
  });

  // Sync collapsed state on mount
  React.useEffect(() => {
    if (onCollapsedChange) {
      onCollapsedChange(isCollapsed);
    }
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed((prev: boolean) => {
      const newState = !prev;
      localStorage.setItem('sidebarCollapsed', JSON.stringify(newState));
      if (onCollapsedChange) {
        onCollapsedChange(newState);
      }
      return newState;
    });
  };
  
  // Hàm xử lý khi click vào menu item
  const handleStepClick = (step: AppStep) => {
    if (isStepEnabled(step)) {
      setActiveStep(step);
      
      // Tự động đóng sidebar trên mobile sau khi chọn menu
      if (typeof window !== 'undefined' && window.innerWidth < 768 && onClose) {
        onClose();
      }
    }
  };
  const processSteps: { key: AppStep; icon: React.ComponentType<{ className?: string }>; label: string; subtext?: string }[] = [
    { key: 'jd', icon: FileText, label: 'Mô tả Công việc', subtext: 'Bước 1/4' },
    { key: 'weights', icon: Sliders, label: 'Trọng số', subtext: 'Bước 2/4' },
    { key: 'upload', icon: Upload, label: 'Tải lên CV', subtext: 'Bước 3/4' },
    { key: 'analysis', icon: Sparkles, label: 'Phân Tích AI', subtext: 'Bước 4/4' },
  ];

  const toolSteps: { key: AppStep; icon: React.ComponentType<{ className?: string }>; label: string; subtext?: string }[] = [
    { key: 'dashboard', icon: PieChart, label: 'Thống Kê Chi Tiết', subtext: 'Biểu đồ' },
    { key: 'chatbot', icon: Bot, label: 'Gợi Ý Ứng Viên', subtext: 'AI Chatbot' },
  ];

  const homeStep = { key: 'home' as AppStep, icon: Home, label: 'Trang chủ', subtext: 'Dashboard' };
  

  const isStepEnabled = (step: AppStep): boolean => {
    if (step === 'home') return true;
    if (step === 'jd') return true;
    if (step === 'weights') return completedSteps.includes('jd');
    if (step === 'upload') return completedSteps.includes('jd') && completedSteps.includes('weights');
    if (step === 'analysis') return completedSteps.includes('jd') && completedSteps.includes('weights') && completedSteps.includes('upload');
    if (step === 'dashboard') return completedSteps.includes('upload'); // Only allowed if upload (and therefore CVs are present/analyzed) is completed
    if (step === 'chatbot') return completedSteps.includes('upload'); 
    if (step === 'process') return true;
    return false;
  };
  
  const renderStep = (step: { key: AppStep; icon: React.ComponentType<{ className?: string }>; label: string; subtext?: string }) => {
    const isActive = activeStep === step.key;
    const isEnabled = isStepEnabled(step.key);
    const isCompleted = completedSteps.includes(step.key);
    const Icon = step.icon;
    
    // Chỉ hiện nút Home khi sidebar đang thu gọn (theo yêu cầu người dùng)
    if (step.key === 'home' && !isCollapsed) return null;

    // Simplified icon color logic for better harmony
    const getIconColor = () => {
      if (isActive) return 'text-cyan-400';
      if (isCompleted) return 'text-slate-400';
      if (!isEnabled) return 'text-slate-600';
      return 'text-slate-400 group-hover:text-slate-200';
    };

    return (
      <li className="w-full px-3 mb-1" key={step.key}>
        <button
          className={`relative flex items-center transition-all duration-300 group
            ${isActive 
              ? 'bg-gradient-to-r from-[#17243B] to-[#1E293B] text-white shadow-md border border-slate-700/50' 
              : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'} 
            ${!isEnabled ? 'opacity-50 cursor-not-allowed grayscale' : 'cursor-pointer'}
            ${isCollapsed ? 'w-11 h-11 justify-center mx-auto rounded-xl p-0 shrink-0' : 'w-full gap-3 px-3 py-2.5 rounded-xl'}`}
          disabled={!isEnabled}
          onClick={() => handleStepClick(step.key)}
          title={isCollapsed ? step.label : ''}
        >
          {/* Active Indicator Line */}
          {isActive && (
            <div className={`absolute top-1/2 -translate-y-1/2 bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.6)] z-10 ${isCollapsed ? '-left-[1px] w-[3px] h-6 rounded-r' : 'left-0 w-1 h-8 rounded-r-full'}`}></div>
          )}

          <div className={`flex items-center justify-center flex-shrink-0 transition-all duration-300 ${getIconColor()} ${isActive ? 'scale-110' : ''}`}> 
            <Icon className="w-5 h-5" />
          </div>
          
          {!isCollapsed && (
            <div className={`flex flex-col text-left transition-all duration-500 ease-[cubic-bezier(0.2,0,0,1)] overflow-hidden max-w-[200px] opacity-100 ${isActive ? 'translate-x-1' : ''}`}>
              <span className="text-[13px] font-semibold">{step.label}</span>
              {step.subtext && <span className="text-[9px] text-slate-500 font-medium">{step.subtext}</span>}
            </div>
          )}
          
          {isCompleted && !isActive && !isCollapsed && (
            <div className="w-1.5 h-1.5 opacity-100 ml-auto bg-emerald-500 rounded-full shadow-[0_0_5px_rgba(16,185,129,0.6)] transition-all duration-500" />
          )}
        </button>
      </li>
    );
  };

  const SectionHeader = ({ title }: { title: string }) => {
    if (isCollapsed) return <div className="h-px bg-slate-800/20 mx-4 my-2" />;
    return (
      <div className="px-6 pt-3 pb-1">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em]">{title}</p>
      </div>
    );
  };

  return (
    <>
      {/* Overlay cho mobile khi sidebar mở */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}
      
      <aside 
        id="cv-sidebar" 
        className={`flex flex-col fixed top-0 left-0 h-screen bg-[#0B1120] border-r border-slate-800/60 shadow-2xl z-50 transition-all duration-500 ease-[cubic-bezier(0.2,0,0,1)] ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } ${isCollapsed ? 'w-20' : 'w-64'}`}
        style={{ overflow: 'visible' }}
      >
        {/* Logo và Brand */}
        <div className={`flex items-center gap-3 px-4 py-4 border-b border-slate-800/60 transition-all duration-300 ${isCollapsed ? 'md:justify-center md:px-0' : ''}`}>
          {/* Logo - click to open sidebar if collapsed, else go Home */}
          <button
            onClick={() => {
              if (isCollapsed) {
                toggleCollapse();
              } else {
                handleStepClick('home');
              }
            }}
            className={`flex items-center justify-center bg-slate-900 rounded-xl border border-slate-700/50 transition-all duration-300 overflow-hidden shadow-lg ${
              isCollapsed ? 'w-11 h-11 mx-auto cursor-pointer hover:border-blue-500/50 hover:shadow-blue-500/20 hover:scale-105' : 'w-10 h-10 cursor-pointer hover:border-blue-500/50 hover:scale-105 flex-shrink-0'
            }`}
            title="Trang chủ"
          >
            <img
              src="/images/logos/logo.jpg"
              alt="Support HR Logo"
              className="w-full h-full object-contain p-1"
            />
          </button>
          
          {/* Text và nút đóng - Chỉ hiện khi expanded */}
          <div className={`flex items-center justify-between overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.2,0,0,1)] ${
            isCollapsed ? 'w-0 opacity-0 md:w-0' : 'w-auto opacity-100 flex-1 ml-2'
          }`}>
            <div className="whitespace-nowrap cursor-pointer hover:opacity-80 transition-opacity" onClick={() => handleStepClick('home')}>
                <h1 className="text-white font-bold text-base leading-none tracking-tight">Support HR</h1>
                <p className="text-[9px] text-slate-500 font-medium tracking-wider uppercase mt-1">AI Recruitment</p>
            </div>
            
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  if (completedSteps.includes('upload')) {
                    onReset();
                    if (typeof window !== 'undefined' && window.innerWidth < 768 && onClose) {
                      onClose();
                    }
                  }
                }}
                disabled={!completedSteps.includes('upload')}
                className={`hidden md:flex items-center justify-center w-6 h-6 rounded-md transition-all duration-300 ${
                  completedSteps.includes('upload')
                    ? 'bg-blue-600/90 hover:bg-blue-500 text-white shadow-sm shadow-blue-900/20 cursor-pointer'
                    : 'bg-slate-800/30 border border-slate-700/30 text-slate-600 cursor-not-allowed'
                }`}
                title="Tạo Chiến Dịch Mới"
              >
                <i className={`fa-solid fa-plus text-xs ${completedSteps.includes('upload') ? 'hover:rotate-90 transition-transform' : ''}`}></i>
              </button>

              <button
                onClick={toggleCollapse}
                className="hidden md:flex items-center justify-center w-6 h-6 bg-slate-800/50 border border-slate-700/50 rounded-md text-slate-400 hover:text-white hover:bg-slate-700 hover:border-slate-600 transition-all duration-300"
                title="Thu gọn sidebar"
              >
                <ChevronLeft className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-1 custom-scrollbar">
          <ul className="flex flex-col gap-1">
            {/* Hiện Home nếu là collapsed */}
            {isCollapsed && renderStep(homeStep)}

            {/* Part 1: QUY TRÌNH PHÂN TÍCH */}
            <SectionHeader title="Quy trình phân tích" />
            {processSteps.map(step => renderStep(step))}

            {/* Part 2: CÔNG CỤ HỖ TRỢ */}
            <SectionHeader title="Công cụ hỗ trợ" />
            {toolSteps.map(step => renderStep(step))}
          </ul>
        </nav>

        {/* User Profile Section - At Bottom (includes History) */}
        <div className="hidden md:block">
          <UserProfileSection 
            userEmail={userEmail}
            onLogout={onLogout}
            onLoginRequest={onLoginRequest}
            isCollapsed={isCollapsed}
            onClose={onClose}
            onShowSettings={onShowSettings}
            onShowHistory={onShowHistory}
          />
        </div>
      </aside>
    </>
  );
};

// User Profile Component
const UserProfileSection: React.FC<{
  userEmail?: string;
  onLogout?: () => void;
  onLoginRequest?: () => void;
  isCollapsed: boolean;
  onClose?: () => void;
  onShowSettings?: () => void;
  onShowHistory?: () => void;
}> = ({ userEmail, onLogout, onLoginRequest, isCollapsed, onClose, onShowSettings, onShowHistory }) => {
  const [showMenu, setShowMenu] = React.useState(false);
  const [userAvatar, setUserAvatar] = React.useState<string | null>(null);
  const [userName, setUserName] = React.useState<string>('');

  // Load avatar and user name
  React.useEffect(() => {
    if (userEmail) {
      const loadUserData = async () => {
        try {
          const { onAuthStateChanged } = await import('firebase/auth');
          const { auth } = await import('../../src/firebase');
          const { UserProfileService } = await import('../../services/du-lieu-va-sync/userProfileService');
          
          const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user && user.email === userEmail) {
              // Set display name from Google
              if (user.displayName) {
                setUserName(user.displayName);
              } else {
                setUserName(userEmail.split('@')[0]);
              }

              // Load avatar - ưu tiên Google photoURL
              if (user.photoURL) {
                // Đăng nhập Google - lấy avatar từ Google
                setUserAvatar(user.photoURL);
              } else {
                // Không có Google photoURL - kiểm tra database hoặc localStorage
                try {
                  const profile = await UserProfileService.getUserProfile(user.uid);
                  if (profile?.avatar) {
                    setUserAvatar(profile.avatar);
                  } else {
                    const localAvatar = localStorage.getItem(`avatar_${userEmail}`);
                    setUserAvatar(localAvatar);
                  }
                } catch {
                  const localAvatar = localStorage.getItem(`avatar_${userEmail}`);
                  setUserAvatar(localAvatar);
                }
              }
            }
          });
          return () => unsubscribe();
        } catch (error) {
          console.error('Error loading user data:', error);
          setUserName(userEmail.split('@')[0]);
        }
      };
      loadUserData();
    }
  }, [userEmail]);

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };
  
  const getAvatarColor = (email: string) => {
    const colors = ['bg-red-500', 'bg-green-500', 'bg-blue-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500'];
    return colors[email.charCodeAt(0) % colors.length];
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && userEmail) {
      if (file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/jpg') {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const avatarDataUrl = e.target?.result as string;
          setUserAvatar(avatarDataUrl);
          
          try {
            const { auth } = await import('../../src/firebase');
            const { UserProfileService } = await import('../../services/du-lieu-va-sync/userProfileService');
            const currentUser = auth.currentUser;
            
            if (currentUser) {
              await UserProfileService.updateUserAvatar(currentUser.uid, avatarDataUrl);
            } else {
              localStorage.setItem(`avatar_${userEmail}`, avatarDataUrl);
            }
          } catch {
            localStorage.setItem(`avatar_${userEmail}`, avatarDataUrl);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  if (!userEmail) {
    return onLoginRequest ? (
      <div className={`border-t border-slate-800 ${isCollapsed ? 'md:p-2 p-3' : 'p-3'}`}>
        <button
          onClick={onLoginRequest}
          className={`w-full flex items-center gap-3 px-3 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg transition-all duration-200 ${isCollapsed ? 'md:justify-center' : ''}`}
          title={isCollapsed ? 'Đăng nhập' : ''}
        >
          <i className="fa-solid fa-right-to-bracket text-sm"></i>
          <span className={`text-sm font-medium transition-all duration-500 ease-[cubic-bezier(0.2,0,0,1)] overflow-hidden ${
            isCollapsed ? 'max-w-0 opacity-0' : 'max-w-[200px] opacity-100'
          }`}>Đăng nhập</span>
        </button>
      </div>
    ) : null;
  }

  return (
    <div className={`border-t border-slate-800 ${isCollapsed ? 'md:p-2 p-3' : 'p-3'}`}>
      <div className="relative">
        {/* Avatar with Email when expanded */}
        <button
          onClick={() => setShowMenu(!showMenu)}
          className={`w-full flex items-center gap-3 py-2.5 px-2 text-slate-300 hover:bg-slate-800/50 rounded-lg transition-all duration-200 ${isCollapsed ? 'justify-center' : ''}`}
          title={isCollapsed ? userEmail : ''}
        >
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm border-2 border-blue-400/50 overflow-hidden flex-shrink-0 hover:border-blue-400 transition-colors">
            {userAvatar ? (
              <img src={userAvatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className={`w-full h-full ${getAvatarColor(userEmail)} flex items-center justify-center`}>
                {getInitials(userName || userEmail)}
              </div>
            )}
          </div>
          <div className={`flex-1 min-w-0 text-left transition-all duration-500 ease-[cubic-bezier(0.2,0,0,1)] overflow-hidden ${
            isCollapsed ? 'max-w-0 opacity-0' : 'max-w-[200px] opacity-100 ml-3'
          }`}>
            <p className="text-sm font-medium text-white truncate">{userName || userEmail.split('@')[0]}</p>
          </div>
        </button>

        {/* Dropdown Menu - Improved Bubble UI */}
        {showMenu && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setShowMenu(false)}
            />
            <div className={`absolute z-50 bg-[#0f172a] border border-slate-700/50 rounded-2xl shadow-2xl shadow-black/50 ring-1 ring-white/10 overflow-hidden transition-all duration-200 
              ${isCollapsed 
                ? 'left-full bottom-0 ml-3 w-72 origin-bottom-left' 
                : 'bottom-full left-0 right-0 mx-2 mb-3 origin-bottom'
              }`}>
              
              {/* User Info Header */}
              <div className="relative px-3 py-3 bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700/50">
                <div className="absolute top-0 right-0 p-2 opacity-10">
                  <i className="fa-solid fa-user-gear text-3xl text-white"></i>
                </div>
                <div className="flex items-center gap-3 relative z-10">
                  <div className="relative group/avatar">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold border-2 border-slate-600 overflow-hidden flex-shrink-0 shadow-lg bg-slate-800">
                      {userAvatar ? (
                        <img src={userAvatar} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <div className={`w-full h-full ${getAvatarColor(userEmail)} flex items-center justify-center text-sm`}>
                          {getInitials(userName || userEmail)}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{userName || userEmail.split('@')[0]}</p>
                    <p className="text-[10px] text-slate-400 truncate font-medium">{userEmail}</p>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="p-1 space-y-0.5 bg-slate-900/50">
                {/* History */}
                {onShowSettings && (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onShowSettings();
                      if (typeof window !== 'undefined' && window.innerWidth < 768 && onClose) {
                        onClose();
                      }
                    }}
                    className="w-full flex items-center gap-2 px-2 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-all group"
                  >
                    <div className="w-7 h-7 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 group-hover:text-indigo-400 group-hover:border-indigo-500/30 transition-all shadow-sm">
                      <i className="fa-solid fa-file-invoice text-xs"></i>
                    </div>
                    <div className="flex-1 text-left">
                      <span className="font-medium block">Mẫu JD</span>
                    </div>
                  </button>
                )}

                {onShowHistory && (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onShowHistory();
                      if (typeof window !== 'undefined' && window.innerWidth < 768 && onClose) {
                        onClose();
                      }
                    }}
                    className="w-full flex items-center gap-2 px-2 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-all group"
                  >
                    <div className="w-7 h-7 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 group-hover:text-blue-400 group-hover:border-blue-500/30 transition-all shadow-sm">
                      <i className="fa-solid fa-clock-rotate-left text-xs"></i>
                    </div>
                    <div className="flex-1 text-left">
                      <span className="font-medium block">Lịch sử</span>
                    </div>
                  </button>
                )}
                
                <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent my-0.5"></div>

                {/* Logout */}
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onLogout?.();
                    if (typeof window !== 'undefined' && window.innerWidth < 768 && onClose) {
                      onClose();
                    }
                  }}
                  className="w-full flex items-center gap-2 px-2 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all group"
                >
                  <div className="w-7 h-7 rounded-md bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 group-hover:bg-red-500/20 transition-all shadow-sm">
                    <i className="fa-solid fa-right-from-bracket text-xs"></i>
                  </div>
                  <span className="font-medium">Đăng xuất</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Sidebar;