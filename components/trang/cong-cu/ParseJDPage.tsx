import React from 'react';
import ChuanHoaJD from './ChuanHoaJD';

const ParseJDPage: React.FC = () => {
  return (
    <div className="w-full min-h-screen flex flex-col bg-[#0B1120]">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-800/60 bg-gradient-to-r from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
            <i className="fa-solid fa-file-lines text-white text-lg"></i>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Parse JD Standardizer</h1>
            <p className="text-sm text-slate-400">Chuẩn hóa mô tả công việc chuyên nghiệp</p>
          </div>
        </div>
      </div>

      {/* Integrated JD Standardizer Component */}
      <div className="flex-1 w-full overflow-auto">
        <ChuanHoaJD />
      </div>
    </div>
  );
};

export default ParseJDPage;
