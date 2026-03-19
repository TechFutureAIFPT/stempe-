import React, { useState, useEffect, useRef } from 'react';
import type { Candidate, AnalysisRunData } from '../../../assets/types';
import { getChatbotAdvice } from '../../../services/ai-va-ml/geminiService';

interface CandidateSuggestionsProps {
  candidates: Candidate[];
  jobPosition: string;
}

const CandidateSuggestions: React.FC<CandidateSuggestionsProps> = ({ candidates, jobPosition }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string, candidateIds?: string[] }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const analysisData: AnalysisRunData = {
    timestamp: Date.now(),
    job: {
      position: jobPosition,
      locationRequirement: localStorage.getItem('currentLocation') || ''
    },
    candidates
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initial greeting
  useEffect(() => {
    setMessages([{ 
      role: 'assistant', 
      content: 'Chào bạn, tôi là trợ lý AI. Dựa trên kết quả phân tích CV và thống kê chi tiết, tôi có thể gợi ý các ứng viên xuất sắc nhất và tạo câu hỏi phỏng vấn phù hợp. Bạn muốn bắt đầu chứ?' 
    }]);
  }, []);

  const handleSend = async (userMsg: string) => {
    if (!userMsg.trim()) return;
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const result = await getChatbotAdvice(analysisData, userMsg);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: result.responseText,
        candidateIds: result.candidateIds
      }]);
    } catch (error) {
       setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Xin lỗi, đã xảy ra lỗi khi kết nối với AI. Vui lòng thử lại sau.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestClick = () => {
    const prompt = 'Hãy gợi ý cho tôi danh sách các ứng viên phù hợp nhất dựa trên kết quả lọc CV. Ghi rõ điểm mạnh cốt lõi và đề xuất ít nhất 3 câu hỏi phỏng vấn cho mỗi người để khai thác điểm yếu của họ.';
    setInput('');
    handleSend(prompt);
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const exportSelectedToCSV = () => {
    if (selectedIds.size === 0) return;

    const selectedData = candidates.filter(c => selectedIds.has(c.id!));
    const csvContent = [
      ['STT', 'HoTen', 'Hang', 'DiemTong', 'PhuHopJD', 'ChucDanh', 'Email', 'SoDienThoai'],
      ...selectedData.map((c, index) => {
        const jdFitScore = c.status === 'FAILED' ? 0 : parseInt(c.analysis?.['Chi tiết']?.find(i => i['Tiêu chí'].startsWith('Phù hợp JD'))?.['Điểm'].split('/')[0] || '0', 10);
        return [
          (index + 1).toString(),
          c.candidateName || '',
          c.status === 'FAILED' ? 'FAILED' : (c.analysis?.['Hạng'] || 'C'),
          c.status === 'FAILED' ? '0' : (c.analysis?.['Tổng điểm']?.toString() || '0'),
          jdFitScore.toString() + '%',
          c.jobTitle || '',
          c.email || '',
          c.phone || ''
        ];
      })
    ].map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n');

    const BOM = '\uFEFF';
    const csvWithBOM = BOM + csvContent;

    const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `ung_vien_duoc_chon_boi_ai_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const formatMessageContent = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, index) => {
      // Bold text formatting
      const formatBold = (str: string) => {
        const parts = str.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, i) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i} className="text-emerald-400 font-bold">{part.slice(2, -2)}</strong>;
          }
          return part;
        });
      };

      if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
        return (
          <li key={index} className="ml-5 list-disc marker:text-cyan-500 my-1">
            {formatBold(line.trim().substring(2))}
          </li>
        );
      }
      
      if (/^(\d+\.|\*\*\d+\.)/.test(line.trim())) {
         return (
          <div key={index} className="my-2 ml-1 text-cyan-300 font-medium">
            {formatBold(line)}
          </div>
        );
      }

      return (
        <React.Fragment key={index}>
          {formatBold(line)}
          {index < lines.length - 1 && <br />}
        </React.Fragment>
      );
    });
  };

  const renderCandidateCards = (ids?: string[]) => {
    if (!ids || ids.length === 0) return null;
    
    return (
      <div className="flex flex-col gap-3 mt-4">
        {ids.map(id => {
          const c = candidates.find(cand => cand.id === id);
          if (!c) return null;
          const isSelected = selectedIds.has(id);

          return (
            <div key={id} className={`p-4 rounded-xl border transition-all ${isSelected ? 'border-emerald-500 bg-emerald-500/10' : 'border-cyan-500/30 bg-slate-800/80'} flex justify-between items-center`}>
               <div className="flex-1">
                 <div className="flex items-center gap-3">
                    <p className="text-base font-bold text-white">{c.candidateName}</p>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${c.analysis?.['Hạng'] === 'A' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'}`}>Hạng {c.analysis?.['Hạng']}</span>
                 </div>
                 <p className="text-sm text-slate-400 mt-1">{c.jobTitle || 'Chưa rõ chức danh'}</p>
                 <div className="flex gap-4 mt-2">
                    <span className="text-xs text-slate-300">Điểm tổng: <span className="font-semibold text-white">{c.analysis?.['Tổng điểm']}</span></span>
                    <span className="text-xs text-slate-300">Trình độ: <span className="font-semibold text-white">{c.experienceLevel || 'Chưa xác định'}</span></span>
                 </div>
               </div>
               <div className="flex flex-col items-end gap-2 shrink-0">
                 <button 
                  onClick={() => handleToggleSelect(id!)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${isSelected ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-700 hover:bg-slate-600 text-slate-200'}`}
                 >
                   {isSelected ? <><i className="fa-solid fa-check"></i> Đã chọn</> : <><i className="fa-solid fa-plus"></i> Chọn ứng viên</>}
                 </button>
               </div>
            </div>
          )
        })}
      </div>
    );
  }

  if (!candidates || candidates.length === 0) {
    return (
      <section id="module-dashboard" className="module-pane active relative w-full h-[calc(100vh)] min-h-[600px] flex flex-col bg-[#0B1120]">
        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-slate-500/5 rounded-full blur-3xl pointer-events-none"></div>



        <div className="flex flex-1 items-center justify-center p-6 text-center z-10">
          <div>
            <div className="relative inline-block mb-6">
              <i className="fa-solid fa-robot text-5xl md:text-6xl text-slate-600 float-animation"></i>
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 rounded-full pulse-animation"></div>
            </div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-3">
              Chưa Có Dữ Liệu
            </h3>
            <p className="text-slate-400 text-lg max-w-md mx-auto leading-relaxed">
              Vui lòng thực hiện phân tích CV trước để AI có thể gợi ý ứng viên cho bạn.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="module-dashboard" className="module-pane active relative w-full h-[calc(100vh)] min-h-[400px] flex flex-col bg-[#0B1120]">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-slate-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-slate-500/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Fixed Header */}


      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden relative z-10 w-full bg-slate-900/30">
        <div className="w-full h-full flex flex-col xl:flex-row">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-w-0 p-2 lg:p-4 border-r border-slate-800/60">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-3 text-slate-200">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                    <i className="fa-solid fa-robot text-white text-lg"></i>
                </div>
                <div>
                  <span className="block">Gợi Ý Ứng Viên</span>
                  <span className="text-xs font-normal text-slate-400 tracking-wide uppercase">Dựa trên kết quả phân tích</span>
                </div>
            </h3>

            <div className="flex-1 overflow-y-auto mb-4 bg-slate-950/60 rounded-2xl p-5 border border-slate-800/80 shadow-inner custom-scrollbar flex flex-col gap-5">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl p-4 shadow-md ${
                            msg.role === 'user' 
                            ? 'bg-gradient-to-br from-blue-600 to-cyan-600 text-white rounded-tr-sm' 
                            : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-tl-sm'
                        }`}>
                            <div className="text-sm max-w-none leading-relaxed">
                                {formatMessageContent(msg.content)}
                            </div>
                            {msg.role === 'assistant' && msg.candidateIds && msg.candidateIds.length > 0 && (
                                <div className="mt-5 pt-4 border-t border-slate-700/50">
                                    <p className="text-xs text-cyan-400 font-semibold mb-2 uppercase tracking-wide">Ứng viên được đề xuất:</p>
                                    {renderCandidateCards(msg.candidateIds)}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-slate-800 border border-slate-700 text-slate-200 rounded-2xl rounded-tl-sm p-4 flex items-center gap-3 shadow-md">
                            <i className="fa-solid fa-circle-notch fa-spin text-cyan-400"></i>
                            <span className="text-sm font-medium">Bảo Bảo AI đang phân tích và tìm ứng viên tốt nhất...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="flex gap-2 mb-3 overflow-x-auto pb-1 custom-scrollbar shrink-0">
                 <button 
                    onClick={handleSuggestClick}
                    disabled={isLoading}
                    className="whitespace-nowrap text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-cyan-400 px-4 py-2 rounded-full border border-slate-700 transition flex items-center gap-2"
                 >
                    <i className="fa-solid fa-lightbulb"></i> Gợi ý ứng viên tiêu biểu + Câu hỏi
                 </button>
                 <button 
                    onClick={() => { setInput(''); handleSend('Hãy phân nhóm các ứng viên theo cấp độ kinh nghiệm (Junior, Mid, Senior) và so sánh ưu khuyết điểm của từng nhóm.'); }}
                    disabled={isLoading}
                    className="whitespace-nowrap text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-purple-400 px-4 py-2 rounded-full border border-slate-700 transition flex items-center gap-2"
                 >
                    <i className="fa-solid fa-layer-group"></i> Phân loại theo cấp độ
                 </button>
            </div>

            <div className="flex gap-3 shrink-0">
                <input 
                    type="text" 
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSend(input)}
                    placeholder="Nhập câu hỏi (vd: Hãy đưa ra 5 câu hỏi phỏng vấn kỹ thuật cho Nguyễn Văn A)..."
                    className="flex-1 bg-slate-950 border border-slate-800 text-white rounded-xl px-5 py-3.5 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 shadow-inner"
                    disabled={isLoading}
                />
                <button 
                    onClick={() => { setInput(''); handleSend(input); }}
                    disabled={isLoading || !input.trim()}
                    className="bg-gradient-to-br from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white w-14 rounded-xl flex items-center justify-center transition shadow-lg shadow-cyan-900/40 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <i className="fa-solid fa-paper-plane text-lg"></i>
                </button>
            </div>
        </div>

        {/* Selected Candidates Sidebar */}
        <div className="w-full xl:w-80 shrink-0 flex flex-col bg-slate-900/80 overflow-hidden">
            <div className="p-4 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between">
                <div>
                   <h4 className="font-bold text-slate-200 text-sm">Được nhà tuyển dụng chọn</h4>
                   <p className="text-xs text-slate-500 mt-0.5">{selectedIds.size} ứng viên</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-sm border border-emerald-500/20">
                    {selectedIds.size}
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
                {selectedIds.size === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-500">
                        <i className="fa-regular fa-folder-open text-4xl mb-3 text-slate-700"></i>
                        <p className="text-sm">Chưa có ứng viên nào được chọn.</p>
                        <p className="text-xs mt-1">Chat với AI và bấm "Chọn ứng viên" để thêm vào danh sách này.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        {Array.from(selectedIds).map(id => {
                            const c = candidates.find(cand => cand.id === id);
                            if (!c) return null;
                            return (
                                <div key={id} className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 relative group">
                                    <button 
                                        onClick={() => handleToggleSelect(id)}
                                        className="absolute top-2 right-2 w-6 h-6 rounded bg-slate-700 hover:bg-red-500/20 text-slate-400 hover:text-red-400 flex items-center justify-center transition-colors"
                                        title="Bỏ chọn"
                                    >
                                        <i className="fa-solid fa-xmark text-xs"></i>
                                    </button>
                                    <p className="text-sm font-bold text-slate-200 pr-6 truncate">{c.candidateName}</p>
                                    <p className="text-xs text-slate-400 truncate mt-0.5">{c.jobTitle}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className={`px-1.5 py-0.5 text-[9px] rounded font-bold ${c.analysis?.['Hạng'] === 'A' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'}`}>Hạng {c.analysis?.['Hạng']}</span>
                                        <span className="text-[10px] text-slate-300">Điểm: {c.analysis?.['Tổng điểm']}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950/50">
                <button
                    onClick={exportSelectedToCSV}
                    disabled={selectedIds.size === 0}
                    className="w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20"
                >
                    <i className="fa-solid fa-file-csv"></i>
                    Xuất danh sách ({selectedIds.size})
                </button>
            </div>
        </div>
      </div>
    </div>
  </section>
  );
};

export default CandidateSuggestions;
