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

    // Keep transition short to reduce perceived lag
    const hideTimer = setTimeout(() => {
      setIsTransitioning(false);
    }, 700);

    // Remove from DOM after transition completes
    const removeTimer = setTimeout(() => {
      setShouldRender(false);
    }, 950);

    return () => {
      clearTimeout(hideTimer);
      clearTimeout(removeTimer);
    };
  }, [location.pathname]);

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 z-[99999] bg-[#020617] flex flex-col items-center justify-center transition-opacity duration-300 ${
        isTransitioning ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="relative z-10 flex flex-col items-center justify-center px-4">
        <div className="h-12 w-12 rounded-full border-4 border-slate-700 border-t-cyan-400 animate-spin" />
        <h3 className="mt-5 text-center text-sm sm:text-base font-medium text-slate-200">
          {loadingMessage}
        </h3>
      </div>
    </div>
  );
};

export default PageTransition;
