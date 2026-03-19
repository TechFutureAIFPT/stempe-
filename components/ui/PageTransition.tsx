import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const PageTransition: React.FC = () => {
  const location = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Đang xử lý dữ liệu...');

  const getMessage = (path: string) => {
    switch (path) {
      case '/jd': 
        return 'Đang khởi tạo trình lọc CV thông minh...';
      case '/weights': 
        return 'Đã lưu mô tả! Đang thiết lập tiêu chí đánh giá...';
      case '/upload': 
        return 'Sẵn sàng! Đang chuyển sang bước nhận diện CV...';
      case '/analysis': 
        return 'Khởi động AI! Đang bắt đầu quá trình phân tích...';
      case '/detailed-analytics': 
        return 'Phân tích xong! Đang tổng hợp báo cáo chi tiết...';
      case '/chatbot': 
        return 'Đang kết nối với Trợ lý AI...';
      case '/':
        return 'Đang chuẩn bị trang chủ...';
      default:
        return 'Đang tối ưu hóa trải nghiệm của bạn...';
    }
  };

  useEffect(() => {
    // Set message based on where we are going
    setLoadingMessage(getMessage(location.pathname));

    // Show loading
    setIsTransitioning(true);
    setShouldRender(true);

    // Hide after a short delay (e.g. 1200ms to let animations be seen)
    const hideTimer = setTimeout(() => {
      setIsTransitioning(false);
    }, 1200);

    // Remove from DOM after transition completes
    const removeTimer = setTimeout(() => {
      setShouldRender(false);
    }, 1700);

    return () => {
      clearTimeout(hideTimer);
      clearTimeout(removeTimer);
    };
  }, [location.pathname]);

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 z-[99999] bg-[#020617] flex flex-col items-center justify-center transition-all duration-500 ease-in-out ${
        isTransitioning ? 'opacity-100 backdrop-blur-xl' : 'opacity-0 backdrop-blur-0'
      }`}
    >
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-5%] left-[-5%] w-[50%] h-[50%] bg-blue-600/10 blur-[130px] rounded-full animate-[float_15s_infinite_ease-in-out]"></div>
        <div className="absolute bottom-[-5%] right-[-5%] w-[50%] h-[50%] bg-cyan-600/10 blur-[130px] rounded-full animate-[float_18s_infinite_ease-in-out_reverse]"></div>
      </div>

      <div className="relative flex flex-col items-center justify-center z-10">
        {/* Glow behind the circle */}
        <div className="absolute w-[300px] h-[300px] bg-blue-500/10 blur-[100px] rounded-full animate-pulse"></div>

        {/* Circular Loader Container */}
        <div className="relative w-48 h-48 flex items-center justify-center">
          {/* SVG Circles */}
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            {/* Outer Decorative Path */}
            <circle
              cx="96" cy="96" r="88"
              fill="none"
              stroke="rgba(51, 65, 85, 0.3)"
              strokeWidth="1"
              strokeDasharray="4 4"
              className="animate-[spin_20s_linear_infinite]"
            />
            {/* Middle Rotating Gaps */}
            <circle
              cx="96" cy="96" r="80"
              fill="none"
              stroke="url(#loaderGradient)"
              strokeWidth="2"
              strokeDasharray="80 160"
              strokeLinecap="round"
              className="animate-[spin_3s_linear_infinite]"
            />
            {/* Inner Liquid Path */}
            <circle
              cx="96" cy="96" r="72"
              fill="none"
              stroke="url(#loaderGradientInner)"
              strokeWidth="4"
              strokeDasharray="100 200"
              strokeLinecap="round"
              className="animate-[spin_1.5s_cubic-bezier(0.4, 0, 0.2, 1)_infinite]"
            />
            <defs>
              <linearGradient id="loaderGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#22D3EE" />
              </linearGradient>
              <linearGradient id="loaderGradientInner" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#1D4ED8" />
                <stop offset="100%" stopColor="#06B6D4" />
              </linearGradient>
            </defs>
          </svg>

          {/* Centered Logo Box */}
          <div className="relative w-24 h-24 rounded-full bg-slate-950/40 backdrop-blur-2xl border border-white/10 flex items-center justify-center overflow-hidden shadow-inner p-1 animate-[breathe_4s_infinite_ease-in-out]">
             <div className="w-full h-full rounded-full overflow-hidden border border-white/5">
                <img 
                  src="/images/logos/logo.jpg" 
                  alt="Logo" 
                  className="w-full h-full object-cover opacity-90"
                />
             </div>
             {/* Circular Shimmer */}
             <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2.5s_infinite]"></div>
          </div>
        </div>

        {/* Text Container */}
        <div className="mt-12 text-center max-w-sm px-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            <span className="text-white font-bold tracking-[0.2em] text-sm uppercase bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
               Processing
            </span>
          </div>
          
          <h3 className="text-slate-200 font-medium text-lg leading-relaxed animate-[fade-in-up_0.5s_ease-out_forwards]">
            {loadingMessage}
          </h3>
          
          <div className="mt-6 flex justify-center gap-1.5">
            {[0, 1, 2].map((i) => (
              <div 
                key={i} 
                className="w-1.5 h-1.5 rounded-full bg-slate-700 animate-[loading-lights_1.5s_infinite]" 
                style={{ animationDelay: `${i * 0.2}s` }}
              ></div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(5%, 10%) scale(1.1); }
        }
        @keyframes breathe {
          0%, 100% { transform: scale(1); box-shadow: 0 0 20px rgba(59, 130, 246, 0.1); }
          50% { transform: scale(1.03); box-shadow: 0 0 40px rgba(59, 130, 246, 0.2); }
        }
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes loading-lights {
          0%, 100% { background: #334155; transform: scale(1); }
          50% { background: #22D3EE; transform: scale(1.2); box-shadow: 0 0 8px rgba(34, 211, 238, 0.4); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default PageTransition;
