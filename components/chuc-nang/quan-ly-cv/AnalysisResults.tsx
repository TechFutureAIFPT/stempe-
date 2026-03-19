
import React, { useState, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import debounce from 'lodash.debounce';
import type { Candidate, DetailedScore, AppStep } from '../../../assets/types';
import ExpandedContent from './ExpandedContent';
// Removed manual history save functionality


interface AnalysisResultsProps {
  isLoading: boolean;
  loadingMessage: string;
  results: Candidate[];
  jobPosition: string;
  locationRequirement: string;
  jdText: string;
  setActiveStep?: (step: AppStep) => void;
  markStepAsCompleted?: (step: AppStep) => void;
}

// --- Inlined Loader Component ---
// This component is inlined to avoid a separate import that fails during lazy loading.
const Loader: React.FC<{ message: string }> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-5 py-20 md:py-24 text-center">
      <div className="h-12 w-12 rounded-full border-4 border-slate-700 border-t-cyan-400 animate-spin" />
      <div className="max-w-md px-4">
        <h3 className="text-base sm:text-lg font-semibold text-slate-100">
          {message || 'Đang phân tích CV với AI...'}
        </h3>
        <p className="mt-2 text-slate-400 text-sm">
          Vui lòng chờ trong giây lát.
        </p>
      </div>
    </div>
  );
};

// --- Main AnalysisResults Component ---

type RankedCandidate = Candidate & { rank: number; jdFitScore: number; gradeValue: number };

// Memoized table row component for performance


const AnalysisResults: React.FC<AnalysisResultsProps> = ({ isLoading, loadingMessage, results, jobPosition, locationRequirement, jdText, setActiveStep, markStepAsCompleted }) => {
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'score' | 'jdFit'>('score');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  const [selectedCandidates, setSelectedCandidates] = useState<Set<string>>(new Set());
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);
  const [expandedCandidate, setExpandedCandidate] = useState<string | null>(null);
  const [expandedCriteria, setExpandedCriteria] = useState<Record<string, Record<string, boolean>>>({});
  // Removed manual save state & handler

  // Debounced search handler
  const debouncedSetSearchTerm = useCallback(
    debounce((value: string) => setDebouncedSearchTerm(value), 300),
    []
  );

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    debouncedSetSearchTerm(value);
  };

  const handleSelectCandidate = (candidateId: string, index: number, isShift: boolean = false) => {
    setSelectedCandidates(prev => {
      const newSet = new Set(prev);
      if (isShift && lastSelectedIndex !== null) {
        const start = Math.min(lastSelectedIndex, index);
        const end = Math.max(lastSelectedIndex, index);
        for (let i = start; i <= end; i++) {
          const id = filteredResults[i]?.id;
          if (id) newSet.add(id);
        }
      } else {
        if (newSet.has(candidateId)) {
          newSet.delete(candidateId);
        } else {
          newSet.add(candidateId);
        }
        setLastSelectedIndex(index);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    const allIds = filteredResults.map(c => c.id).filter(Boolean);
    setSelectedCandidates(prev => {
      if (prev.size === allIds.length) {
        return new Set();
      } else {
        return new Set(allIds);
      }
    });
  };

  const handleRemoveSelected = (candidateId: string) => {
    setSelectedCandidates(prev => {
      const newSet = new Set(prev);
      newSet.delete(candidateId);
      return newSet;
    });
  };

  const handleClearAllSelected = () => {
    if (window.confirm('Bạn có chắc muốn bỏ chọn tất cả ứng viên?')) {
      setSelectedCandidates(new Set());
    }
  };

  const handleExpandCandidate = (candidateId: string) => {
    setExpandedCandidate(expandedCandidate === candidateId ? null : candidateId);
  };

  const handleToggleCriterion = (candidateId: string, criterion: string) => {
    setExpandedCriteria(prev => ({
      ...prev,
      [candidateId]: {
        ...prev[candidateId],
        [criterion]: !prev[candidateId]?.[criterion]
      }
    }));
  };

  const exportSelectedToCSV = () => {
    if (selectedCandidates.size === 0) return;

    const selectedData = filteredResults.filter(c => selectedCandidates.has(c.id));
    const csvContent = [
      ['STT', 'HoTen', 'Hang', 'DiemTong', 'PhuHopJD%', 'ChucDanh', 'FileName', 'CandidateID'],
      ...selectedData.map((c, index) => [
        (index + 1).toString(),
        c.candidateName || '',
        c.status === 'FAILED' ? 'FAILED' : (c.analysis?.['Hạng'] || 'C'),
        c.status === 'FAILED' ? '0' : (c.analysis?.['Tổng điểm']?.toString() || '0'),
        c.status === 'FAILED' ? '0' : (parseInt(c.analysis?.['Chi tiết']?.find(i => i['Tiêu chí'].startsWith('Phù hợp JD'))?.['Điểm'].split('/')[0] || '0', 10)).toString(),
        c.jobTitle || '',
        c.fileName || '',
        c.id || ''
      ])
    ].map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n');

    // Thêm BOM để Excel nhận ra UTF-8
    const BOM = '\uFEFF';
    const csvWithBOM = BOM + csvContent;

    const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `ung_vien_da_chon_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const summaryData = useMemo(() => {
    if (!results || results.length === 0) {
      return { total: 0, countA: 0, countB: 0, countC: 0 };
    }
    const successfulCandidates = results.filter(c => c.status === 'SUCCESS' && c.analysis);
    const countA = successfulCandidates.filter(c => c.analysis?.['Hạng'] === 'A').length;
    const countB = successfulCandidates.filter(c => c.analysis?.['Hạng'] === 'B').length;
    const countC = results.length - countA - countB; // Includes failed and grade C
    return {
      total: successfulCandidates.length,
      countA,
      countB,
      countC,
    };
  }, [results]);

  const analysisData = useMemo(() => {
    if (!results || results.length === 0) return null;
    return {
      timestamp: Date.now(),
      job: {
        position: jobPosition,
        locationRequirement: locationRequirement || 'Không có',
      },
      candidates: results.map((c, index) => ({
        ...c,
        id: c.id || `candidate-${index}-${c.fileName}-${c.candidateName}`.replace(/[^a-zA-Z0-9]/g, '-')
      })),
    };
  }, [results, jobPosition, locationRequirement]);

  const rankedAndSortedResults = useMemo((): RankedCandidate[] => {
    if (!results || results.length === 0) return [];
    const gradeValues: { [key: string]: number } = { 'A': 3, 'B': 2, 'C': 1, 'FAILED': 0 };
    const enrichedResults = results.map(c => ({
        ...c,
        jdFitScore: parseInt(c.analysis?.['Chi tiết']?.find(i => i['Tiêu chí'].startsWith('Phù hợp JD'))?.['Điểm'].split('/')[0] || '0', 10),
        gradeValue: gradeValues[c.status === 'FAILED' ? 'FAILED' : (c.analysis?.['Hạng'] || 'C')]
    }));
    enrichedResults.sort((a, b) => {
      const primaryDiff = sortBy === 'score' ? (b.analysis?.['Tổng điểm'] || 0) - (a.analysis?.['Tổng điểm'] || 0) : b.jdFitScore - a.jdFitScore;
      if (primaryDiff !== 0) return primaryDiff;
      const secondaryDiff = sortBy === 'score' ? b.jdFitScore - a.jdFitScore : (b.analysis?.['Tổng điểm'] || 0) - (a.analysis?.['Tổng điểm'] || 0);
      if (secondaryDiff !== 0) return secondaryDiff;
      return b.gradeValue - a.gradeValue;
    });
    return enrichedResults.map((c, index) => ({ ...c, rank: index + 1 }));
  }, [results, sortBy]);

  const filteredResults = useMemo(() => {
    let resultsToFilter = rankedAndSortedResults;
    if (debouncedSearchTerm) resultsToFilter = resultsToFilter.filter(c => (c.candidateName?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())) || (c.jobTitle?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())));
    if (filter !== 'all') resultsToFilter = resultsToFilter.filter(c => c.status === 'FAILED' ? filter === 'C' : c.analysis?.['Hạng'] === filter);
    
    // Remove duplicates based on id
    const uniqueResults = resultsToFilter.filter((candidate, index, self) => 
      index === self.findIndex(c => c.id === candidate.id)
    );
    
    return uniqueResults;
  }, [rankedAndSortedResults, filter, debouncedSearchTerm]);

  if (isLoading) return <section id="module-analysis" className="module-pane active w-full"><Loader message={loadingMessage} /></section>;

  if (results.length === 0) return (
    <section id="module-analysis" className="module-pane active w-full">
      <div className="text-center py-16 md:py-20">
        <div className="relative inline-block mb-6"><i className="fa-solid fa-chart-line text-5xl md:text-6xl text-slate-600 float-animation"></i><div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 rounded-full pulse-animation"></div></div>
        <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-3">Sẵn Sàng Phân Tích</h3>
        <p className="text-slate-400 text-lg max-w-md mx-auto leading-relaxed">Kết quả AI sẽ xuất hiện ở đây sau khi bạn cung cấp mô tả công việc và các tệp CV.</p>
      </div>
    </section>
  );

  return (
    <>
      <section id="module-analysis" className="module-pane active relative w-full h-[calc(100vh)] min-h-[400px] flex flex-col bg-[#0B1120]">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-slate-500/5 rounded-full blur-3xl pointer-events-none"></div>



      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden relative z-10 w-full h-[calc(100vh-6rem)]">
        <div className="w-full h-full p-4 lg:p-6 lg:px-8 overflow-y-auto custom-scrollbar space-y-6">
        <div className="rounded-3xl border border-slate-800 bg-slate-950/60 p-3 sm:p-4 shadow-2xl shadow-black/30 mb-4 flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
          <div className="flex-1">
            <p className="text-[11px] uppercase tracking-[0.35em] text-slate-500 font-semibold">Chiến dịch hiện tại</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1 pt-0.5 tracking-tight line-clamp-1" title={analysisData?.job.position || jobPosition}>{analysisData?.job.position || jobPosition}</h2>
            <p className="text-slate-400 text-xs mt-1">Phân tích lúc <span className="text-slate-200 font-semibold">{analysisData ? new Date(analysisData.timestamp).toLocaleString('vi-VN') : 'Không rõ'}</span></p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <div className="flex items-center gap-2 text-xs font-medium">
              <span className="px-3 py-1.5 rounded-full border border-slate-700 bg-slate-800/80 text-slate-300 shadow-sm">Tổng: {summaryData.total}</span>
              <span className="px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 shadow-sm">A: {summaryData.countA}</span>
              <span className="px-3 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 shadow-sm">B: {summaryData.countB}</span>
              <span className="px-3 py-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 text-rose-300 shadow-sm">C/Lỗi: {summaryData.countC}</span>
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => {
                  if (setActiveStep) setActiveStep('dashboard');
                  if (markStepAsCompleted) markStepAsCompleted('analysis');
                  window.location.hash = '#/detailed-analytics';
                }}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl bg-slate-800 border border-slate-600 hover:bg-slate-700 hover:border-slate-500 px-4 py-2 text-sm font-semibold text-white transition-all shadow-md group whitespace-nowrap"
              >
                <i className="fa-solid fa-chart-line text-slate-400 group-hover:text-white transition-colors"></i>
                <span className="hidden sm:inline">Xem</span> Thống Kê
              </button>
              <button
                onClick={() => {
                  if (setActiveStep) setActiveStep('chatbot');
                  if (markStepAsCompleted) markStepAsCompleted('analysis');
                  window.location.hash = '#/chatbot';
                }}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-cyan-900/40 transition-all hover:-translate-y-0.5 whitespace-nowrap"
              >
                <i className="fa-solid fa-robot drop-shadow-md"></i>
                Gợi Ý <span className="hidden sm:inline">Ứng Viên</span>
              </button>
            </div>
          </div>
        </div>
        {/* KPI cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            { label: 'Tổng CV Phân Tích', value: summaryData.total, accent: 'from-slate-800 via-slate-900 to-slate-950', text: 'text-white' },
            { label: 'Hạng A', value: summaryData.countA, accent: 'from-emerald-900/40 via-emerald-900/10 to-slate-950', text: 'text-emerald-300' },
            { label: 'Hạng B', value: summaryData.countB, accent: 'from-blue-900/40 via-blue-900/10 to-slate-950', text: 'text-sky-300' },
            { label: 'Hạng C/Lỗi', value: summaryData.countC, accent: 'from-rose-900/40 via-rose-900/10 to-slate-950', text: 'text-rose-300' }
          ].map((card) => (
            <div key={card.label} className={`rounded-3xl border border-white/5 bg-gradient-to-br ${card.accent} p-3 shadow-xl shadow-black/30`}> 
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{card.label}</p>
              <p className={`text-4xl font-semibold mt-3 ${card.text}`}>{card.value}</p>
            </div>
          ))}
        </div>

        {/* Filter bar */}
        <div className="rounded-3xl border border-slate-800 bg-slate-950/60 p-3 sm:p-4 shadow-inner shadow-black/30">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-sm">
              <i className="fa-solid fa-magnifying-glass text-slate-500 absolute left-4 top-1/2 -translate-y-1/2"></i>
              <input
                type="text"
                placeholder="Tìm theo tên, chức danh..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full rounded-2xl border border-slate-800 bg-slate-900/80 pl-12 pr-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {[
                { label: 'Tất cả', value: 'all', cls: 'bg-slate-900/70 text-slate-300' },
                { label: 'Hạng A', value: 'A', cls: 'bg-emerald-500/10 text-emerald-200' },
                { label: 'Hạng B', value: 'B', cls: 'bg-blue-500/10 text-blue-200' },
                { label: 'Hạng C', value: 'C', cls: 'bg-amber-500/10 text-amber-200' },
                { label: 'Lỗi', value: 'FAILED', cls: 'bg-rose-500/10 text-rose-200' }
              ].map((chip) => (
                <button
                  key={chip.value}
                  onClick={() => setFilter(chip.value)}
                  className={`px-4 py-1.5 rounded-full border transition ${filter === chip.value ? 'border-cyan-400 text-white shadow-cyan-500/20' : 'border-slate-800 text-slate-400 hover:border-cyan-500/30'} ${chip.cls}`}
                >
                  {chip.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <span className="text-slate-500">Sắp xếp</span>
              <div className="relative">
                <select
                  id="sort-by"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'score' | 'jdFit')}
                  className="appearance-none rounded-full border border-slate-800 bg-slate-900/80 py-2 pl-4 pr-10 font-semibold text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30"
                >
                  <option value="score">Điểm Tổng</option>
                  <option value="jdFit">Phù hợp JD</option>
                </select>
                <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Results table */}
        <div className="rounded-3xl border border-slate-900 bg-slate-950/70 shadow-2xl shadow-black/50 overflow-hidden">
          <div className="hidden md:block max-h-[70vh] overflow-y-auto results-container">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10 bg-slate-900/90 backdrop-blur">
                <tr className="text-slate-300">
                  <th className="px-5 py-3 text-left font-semibold w-16">STT</th>
                  <th className="px-5 py-3 text-left font-semibold">Họ tên</th>
                  <th className="px-5 py-3 text-left font-semibold">Hạng</th>
                  <th className="px-5 py-3 text-left font-semibold">Điểm</th>
                  <th className="px-5 py-3 text-left font-semibold">Phù hợp JD</th>
                  <th className="px-5 py-3 text-left font-semibold">File</th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.map((candidate, index) => {
                  const isSelected = selectedCandidates.has(candidate.id);
                  const grade = candidate.status === 'FAILED' ? 'FAILED' : (candidate.analysis?.['Hạng'] || 'C');
                  const overallScore = candidate.status === 'FAILED' ? 0 : (candidate.analysis?.['Tổng điểm'] || 0);
                  const jdFitScore = candidate.status === 'FAILED' ? 0 : parseInt(candidate.analysis?.['Chi tiết']?.find(i => i['Tiêu chí'].startsWith('Phù hợp JD'))?.['Điểm'].split('/')[0] || '0', 10);

                  return (
                    <React.Fragment key={candidate.id}>
                      <tr
                        className={`border-t border-slate-800/80 ${isSelected ? 'bg-cyan-500/5' : 'hover:bg-slate-900/60'} cursor-pointer transition-colors duration-150`}
                        onClick={(e) => {
                          if ((e.target as HTMLInputElement).type !== 'checkbox') {
                            handleExpandCandidate(candidate.id);
                          }
                        }}
                      >
                        <td className="px-5 py-3">
                          <span className="text-slate-400 font-medium">#{index + 1}</span>
                        </td>
                        <td className="px-5 py-3 font-medium text-slate-100">{candidate.candidateName || 'Chưa xác định'}</td>
                        <td className="px-5 py-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            candidate.status === 'FAILED'
                              ? 'bg-slate-800 text-slate-400'
                              : grade === 'A'
                                ? 'bg-emerald-500/15 text-emerald-300'
                                : grade === 'B'
                                  ? 'bg-sky-500/15 text-sky-300'
                                  : 'bg-rose-500/15 text-rose-300'
                          }`}>
                            {grade}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-slate-100">{overallScore}</td>
                        <td className="px-5 py-3 text-slate-100">{jdFitScore}%</td>
                        <td className="px-5 py-3 text-slate-200 flex items-center justify-between gap-3">
                          <span className="truncate">{candidate.fileName || ''}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleExpandCandidate(candidate.id);
                            }}
                            className="text-cyan-400 hover:text-white"
                          >
                            <i className={`fa-solid fa-chevron-down transition-transform duration-300 ${expandedCandidate === candidate.id ? 'rotate-180' : ''}`}></i>
                          </button>
                        </td>
                      </tr>

                    </React.Fragment>
                  );
                })}
                {filteredResults.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-slate-500">
                      <i className="fa-solid fa-ghost text-4xl mb-4"></i>
                      <p>Không có ứng viên nào khớp với bộ lọc của bạn.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden max-h-[70vh] overflow-y-auto p-4 space-y-4 results-container">
            {filteredResults.map((candidate, index) => {
              const isSelected = selectedCandidates.has(candidate.id);
              const grade = candidate.status === 'FAILED' ? 'FAILED' : (candidate.analysis?.['Hạng'] || 'C');
              const overallScore = candidate.status === 'FAILED' ? 0 : (candidate.analysis?.['Tổng điểm'] || 0);
              const jdFitScore = candidate.status === 'FAILED' ? 0 : parseInt(candidate.analysis?.['Chi tiết']?.find(i => i['Tiêu chí'].startsWith('Phù hợp JD'))?.['Điểm'].split('/')[0] || '0', 10);

              return (
                <div key={candidate.id} className={`rounded-xl border ${isSelected ? 'border-cyan-500/50 bg-cyan-500/5' : 'border-slate-800 bg-slate-900/40'} p-4 transition-all`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-slate-500 font-medium text-sm">#{index + 1}</span>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-slate-200 text-base truncate max-w-[180px]">{candidate.candidateName || 'Chưa xác định'}</h4>
                        <p className="text-xs text-slate-500 mt-0.5 truncate max-w-[180px]">{candidate.jobTitle || 'Chưa có chức danh'}</p>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold shrink-0 ${
                      candidate.status === 'FAILED'
                        ? 'bg-slate-800 text-slate-400'
                        : grade === 'A'
                          ? 'bg-emerald-500/15 text-emerald-300'
                          : grade === 'B'
                            ? 'bg-sky-500/15 text-sky-300'
                            : 'bg-rose-500/15 text-rose-300'
                    }`}>
                      {grade}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="bg-slate-950/50 rounded-lg p-2 border border-slate-800/50">
                      <p className="text-xs text-slate-500 mb-1">Điểm tổng</p>
                      <p className="text-lg font-semibold text-slate-200">{overallScore}</p>
                    </div>
                    <div className="bg-slate-950/50 rounded-lg p-2 border border-slate-800/50">
                      <p className="text-xs text-slate-500 mb-1">Phù hợp JD</p>
                      <p className="text-lg font-semibold text-slate-200">{jdFitScore}%</p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between pt-3 border-t border-slate-800/50">
                    <span className="text-xs text-slate-500 truncate max-w-[150px]">{candidate.fileName}</span>
                    <button
                      onClick={() => handleExpandCandidate(candidate.id)}
                      className="flex items-center gap-1 text-xs font-medium text-cyan-400 hover:text-cyan-300 px-2 py-1 rounded hover:bg-cyan-500/10 transition-colors"
                    >
                      {expandedCandidate === candidate.id ? 'Thu gọn' : 'Chi tiết'}
                      <i className={`fa-solid fa-chevron-down transition-transform duration-300 ${expandedCandidate === candidate.id ? 'rotate-180' : ''}`}></i>
                    </button>
                  </div>


                </div>
              );
            })}
            {filteredResults.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                <i className="fa-solid fa-ghost text-4xl mb-4"></i>
                <p>Không có ứng viên nào khớp với bộ lọc của bạn.</p>
              </div>
            )}
          </div>
        </div>

        {expandedCandidate && results.find(c => c.id === expandedCandidate) && typeof document !== 'undefined' && createPortal(
          <div className="fixed inset-0 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200" style={{ zIndex: 99999 }}>
            <div className="bg-slate-900 border border-slate-700 w-full max-w-7xl h-full max-h-[95vh] rounded-2xl shadow-2xl shadow-black/50 overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-200">
              <div className="flex-none p-4 lg:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
                <h3 className="text-xl lg:text-2xl font-bold text-slate-200 line-clamp-1 flex items-center gap-3">
                  <i className="fa-solid fa-file-invoice text-cyan-400"></i>
                  Kết quả chi tiết: {results.find(c => c.id === expandedCandidate)?.candidateName}
                </h3>
                <button
                  onClick={() => setExpandedCandidate(null)}
                  className="w-10 h-10 flex-none rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
                >
                  <i className="fa-solid fa-times text-xl"></i>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 lg:p-6 custom-scrollbar bg-slate-900">
                <ExpandedContent
                  candidate={results.find(c => c.id === expandedCandidate)!}
                  expandedCriteria={expandedCriteria}
                  onToggleCriterion={handleToggleCriterion}
                  jdText={jdText}
                />
              </div>
            </div>
          </div>,
          document.body
        )}
        </div>
      </div>
    </section>
    </>
  );
};


export default AnalysisResults;