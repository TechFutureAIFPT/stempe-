import React from 'react';

interface ScreenerHeaderProps {
  title?: string;
  subtitle?: string;
  icon?: string;
  children?: React.ReactNode;
  className?: string;
}

const ScreenerHeader: React.FC<ScreenerHeaderProps> = ({ 
  title = "Screener", 
  subtitle = "JOB DESCRIPTION ANALYTICS", 
  icon = "fa-wand-magic-sparkles",
  children,
  className = ""
}) => {
  return (
    <div className={`w-full flex flex-col md:flex-row md:items-center justify-between gap-4 py-2.5 px-6 border-b border-slate-800/60 bg-[#0B1120] sticky top-0 z-30 ${className}`}>
      <div className="flex items-center gap-3 min-w-max">
        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.15)] group">
          <i className={`fa-solid ${icon} text-purple-400 text-xl drop-shadow-[0_0_8px_rgba(168,85,247,0.5)] transition-transform group-hover:scale-110`}></i>
        </div>
        <div>
          <h2 className="text-lg font-bold text-white tracking-wide leading-tight">{title}</h2>
          <p className="text-[9px] text-slate-500 tracking-[0.2em] font-medium uppercase mt-0.5">{subtitle}</p>
        </div>
      </div>
      
      {children && (
        <div className="flex items-center gap-3 ml-auto">
          {children}
        </div>
      )}
    </div>
  );
};

export default ScreenerHeader;
