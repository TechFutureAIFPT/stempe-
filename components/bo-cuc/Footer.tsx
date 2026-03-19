import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="mt-auto bg-[#040814] border-t border-slate-800/80 relative z-10 w-full">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Column 1: Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-md overflow-hidden bg-black flex items-center justify-center border border-white/10">
                <img
                  src="/images/logos/logo.jpg"
                  alt="SupportHR"
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="font-bold text-white tracking-wide text-sm">SupportHR</p>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed pr-4 font-medium">
              Nền tảng AI chuyên biệt cho tuyển dụng.
            </p>
            <div className="flex items-center gap-2 text-sm text-emerald-400 font-medium pt-1">
              <i className="fa-solid fa-check"></i>
              <span>Sẵn dùng 24/7</span>
            </div>
          </div>

          {/* Column 2: Sản phẩm */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">SẢN PHẨM</h4>
            <div className="flex flex-col space-y-3.5 text-sm text-slate-400 font-medium">
              <Link to="#" className="hover:text-white transition-colors">Tính năng chính</Link>
              <Link to="#" className="hover:text-white transition-colors">Bảng giá</Link>
              <Link to="#" className="hover:text-white transition-colors">So sánh</Link>
              <Link to="#" className="hover:text-white transition-colors">Cách sử dụng</Link>
            </div>
          </div>

          {/* Column 3: Công ty */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">CÔNG TY</h4>
            <div className="flex flex-col space-y-3.5 text-sm text-slate-400 font-medium">
              <Link to="#" className="hover:text-white transition-colors">Về chúng tôi</Link>
              <Link to="#" className="hover:text-white transition-colors">Blog</Link>
              <Link to="#" className="hover:text-white transition-colors">Tuyển dụng</Link>
              <Link to="#" className="hover:text-white transition-colors">Changelog</Link>
            </div>
          </div>

          {/* Column 4: Liên hệ */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">LIÊN HỆ</h4>
            <div className="space-y-4 text-sm font-medium">
              <div>
                <p className="text-slate-500 mb-1">Điện thoại</p>
                <a href="tel:0899280108" className="text-white hover:text-blue-300 transition-colors">
                  0899 280 108
                </a>
              </div>
              <div>
                <p className="text-slate-500 mb-1">Email</p>
                <a href="mailto:support@supporthr.vn" className="text-white hover:text-emerald-300 transition-colors">
                  support@supporthr.vn
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-6 border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-[13px] text-slate-400 font-medium">
            <span>© 2026 SupportHR.</span>
            <span>|</span>
            <a
              href="https://github.com/phucdevweb"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <i className="fa-brands fa-github text-base"></i>
              phucdevweb
            </a>
          </div>

          <div className="flex items-center gap-4 text-[13px] text-slate-400 font-medium">
            <Link to="/privacy-policy" className="hover:text-white transition-colors">
              Bảo mật
            </Link>
            <span>|</span>
            <Link to="/terms" className="hover:text-white transition-colors">
              Điều khoản
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
