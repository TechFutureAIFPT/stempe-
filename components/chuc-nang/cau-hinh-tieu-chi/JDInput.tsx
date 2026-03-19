import React, { useState } from 'react';
import { extractTextFromJdFile } from '../../../services/xu-ly-file/ocrService';
import { extractJobPositionFromJD, filterAndStructureJD, extractHardFiltersFromJD } from '../../../services/ai-va-ml/geminiService';
import { googleDriveService } from '../../../services/xu-ly-file/googleDriveService';
import type { HardFilters } from '../../../assets/types';
import ScreenerHeader from '../../ui/ScreenerHeader';

interface JDInputProps {
  jdText: string;
  setJdText: React.Dispatch<React.SetStateAction<string>>;
  jobPosition: string;
  setJobPosition: React.Dispatch<React.SetStateAction<string>>;
  hardFilters: HardFilters;
  setHardFilters: React.Dispatch<React.SetStateAction<HardFilters>>;
  onComplete: () => void;
}

const JDInput: React.FC<JDInputProps> = ({ jdText, setJdText, jobPosition, setJobPosition, hardFilters, setHardFilters, onComplete }) => {
  const isCompleteEnabled = jdText.trim().length > 50 && jobPosition.trim().length > 3;
  const characterCount = jdText.length;

  const [isOcrLoading, setIsOcrLoading] = useState(false);
  const [ocrMessage, setOcrMessage] = useState('');
  const [ocrError, setOcrError] = useState('');
  
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summarizeError, setSummarizeError] = useState('');
  const [showUploadOptions, setShowUploadOptions] = useState(false);
  const [showEditor, setShowEditor] = useState(() => jdText.length > 0);

  const getFriendlyErrorMessage = (error: unknown, context: 'ocr' | 'summarize'): string => {
    console.error(`Lỗi trong quá trình ${context}:`, error); // Log the original error for debugging
  
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      // This error is already user-friendly
      if (message.includes('không thể trích xuất đủ nội dung')) {
        return error.message;
      }
      if (message.includes('network') || message.includes('failed to fetch')) {
        return "Lỗi kết nối mạng. Vui lòng kiểm tra lại đường truyền và thử lại.";
      }
      if (message.includes('gemini') || message.includes('api')) {
          return "Dịch vụ AI đang gặp sự cố. Vui lòng thử lại sau ít phút.";
      }
    }
    return `Đã có lỗi không mong muốn xảy ra trong quá trình ${context === 'ocr' ? 'quét file' : 'tối ưu JD'}. Vui lòng thử lại.`;
  };

  const handleGoogleDriveSelect = async () => {
    try {
      const token = await googleDriveService.authenticate();
      const driveFiles = await googleDriveService.openPicker({
        mimeTypes: 'application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/png,image/jpeg',
        multiSelect: false
      });

      if (driveFiles.length > 0) {
        const dFile = driveFiles[0];
        setIsOcrLoading(true);
        setOcrError('');
        setSummarizeError('');
        setJdText('');
        setJobPosition('');
        setOcrMessage(`Đang tải ${dFile.name} từ Drive...`);

        try {
            const blob = await googleDriveService.downloadFile(dFile.id, token);
            const file = new File([blob], dFile.name, { type: dFile.mimeType });
            
            await processFile(file);

        } catch (err) {
            console.error(`Failed to download ${dFile.name}`, err);
            setOcrError('Không thể tải file từ Google Drive.');
            setIsOcrLoading(false);
        }
      }
    } catch (err: any) {
      console.error("Google Drive Error:", err);
      if (err.message && (err.message.includes('Client ID') || err.message.includes('API Key'))) {
         setOcrError('Chưa cấu hình Google Drive API.');
      } else {
         setOcrError('Lỗi khi kết nối Google Drive.');
      }
    }
  };

  const processFile = async (file: File) => {
    try {
      const rawText = await extractTextFromJdFile(file, (message) => {
        setOcrMessage(message);
      });

      if (!rawText || rawText.trim().length < 50) {
        throw new Error('Không thể trích xuất đủ nội dung từ file. Vui lòng thử file khác hoặc nhập thủ công.');
      }
      
      setOcrMessage('Đang cấu trúc JD...');
      const structuredJd = await filterAndStructureJD(rawText);
      setJdText(structuredJd);

      setOcrMessage('Đang trích xuất chức danh...');
      const extractedPosition = await extractJobPositionFromJD(structuredJd);
      let successMessage = '';
      
      if (extractedPosition) {
        setJobPosition(extractedPosition);
        successMessage = `✓ Đã phát hiện chức danh: ${extractedPosition}`;
      }

      setOcrMessage('Đang phân tích tiêu chí lọc...');
      const extractedFilters = await extractHardFiltersFromJD(structuredJd);
      if (extractedFilters && Object.keys(extractedFilters).length > 0) {
        const mandatoryUpdates: any = {};
        if (extractedFilters.location) mandatoryUpdates.locationMandatory = true;
        if (extractedFilters.minExp) mandatoryUpdates.minExpMandatory = true;
        if (extractedFilters.seniority) mandatoryUpdates.seniorityMandatory = true;
        if (extractedFilters.education) mandatoryUpdates.educationMandatory = true;
        if (extractedFilters.language) mandatoryUpdates.languageMandatory = true;
        if (extractedFilters.certificates) mandatoryUpdates.certificatesMandatory = true;
        if (extractedFilters.workFormat) mandatoryUpdates.workFormatMandatory = true;
        if (extractedFilters.contractType) mandatoryUpdates.contractTypeMandatory = true;
        
        setHardFilters(prev => ({ ...prev, ...extractedFilters, ...mandatoryUpdates }));
        const extractedInfo = Object.entries(extractedFilters)
          .filter(([_, value]) => value && value !== '')
          .map(([key, value]) => {
             const fieldNames: any = {
              location: 'Địa điểm',
              minExp: 'Kinh nghiệm',
              seniority: 'Cấp bậc',
              education: 'Học vấn',
              language: 'Ngôn ngữ',
              languageLevel: 'Trình độ',
              certificates: 'Chứng chỉ',
              workFormat: 'Hình thức',
              contractType: 'Loại hợp đồng'
            };
            return `${fieldNames[key] || key}: ${value}`;
          }).join(', ');
        
        if (extractedInfo) {
          const tickedCount = Object.keys(mandatoryUpdates).length;
          successMessage += successMessage ? ` | 🎯 Đã điền & tick ✓ ${tickedCount} tiêu chí: ${extractedInfo}` : `✓ 🎯 Đã tự động điền & tick ✓ ${tickedCount} tiêu chí: ${extractedInfo}`;
        }
      }
      
      if (successMessage) {
        setOcrMessage(successMessage);
        setShowEditor(true);
        setTimeout(() => setOcrMessage(''), 7000);
      } else {
        setOcrMessage('⚠ Vui lòng nhập chức danh và kiểm tra tiêu chí lọc thủ công');
        setShowEditor(true);
        setTimeout(() => setOcrMessage(''), 3000);
      }
      
    } catch (error) {
      const friendlyMessage = getFriendlyErrorMessage(error, 'ocr');
      setOcrError(friendlyMessage);
      setJdText(''); 
    } finally {
      setIsOcrLoading(false);
      // Giữ ocrMessage để vẫn hiện thông báo trong Editor
    }
  };

  const handleOcrFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsOcrLoading(true);
    setOcrError('');
    setSummarizeError('');
    setJdText(''); 
    setJobPosition(''); 
    setOcrMessage('Bắt đầu xử lý file...');

    await processFile(file);
  };
  
  const handleSummarizeJD = async () => {
    if (jdText.trim().length < 200) {
      setSummarizeError("Nội dung JD quá ngắn để tóm tắt.");
      return;
    }
    
    setIsSummarizing(true);
    setSummarizeError('');
    setOcrError(''); // Clear other errors

    try {
      const structuredJd = await filterAndStructureJD(jdText);
      setJdText(structuredJd);

      const extractedPosition = await extractJobPositionFromJD(structuredJd);
      console.log('🔍 AI Optimizer extracted position:', extractedPosition); // Debug log
      
      if (extractedPosition) {
        setJobPosition(extractedPosition);
        console.log('✓ AI đã trích xuất chức danh:', extractedPosition);
      } else {
        console.log('❌ AI Optimizer: No job position extracted'); // Debug log
      }

      // Extract hard filters from optimized JD with smart conversion
      const extractedFilters = await extractHardFiltersFromJD(structuredJd);
      if (extractedFilters && Object.keys(extractedFilters).length > 0) {
        // Auto-tick mandatory checkboxes for any extracted field
        const mandatoryUpdates: any = {};
        if (extractedFilters.location) mandatoryUpdates.locationMandatory = true;
        if (extractedFilters.minExp) mandatoryUpdates.minExpMandatory = true;
        if (extractedFilters.seniority) mandatoryUpdates.seniorityMandatory = true;
        if (extractedFilters.education) mandatoryUpdates.educationMandatory = true;
        if (extractedFilters.language) mandatoryUpdates.languageMandatory = true;
        if (extractedFilters.certificates) mandatoryUpdates.certificatesMandatory = true;
        if (extractedFilters.workFormat) mandatoryUpdates.workFormatMandatory = true;
        if (extractedFilters.contractType) mandatoryUpdates.contractTypeMandatory = true;
        
        setHardFilters(prev => ({ ...prev, ...extractedFilters, ...mandatoryUpdates }));
        console.log('✓ AI đã tự động điền & tick tiêu chí lọc:', extractedFilters, 'Mandatory:', mandatoryUpdates);
      }

    } catch (error) {
      const friendlyMessage = getFriendlyErrorMessage(error, 'summarize');
      setSummarizeError(friendlyMessage);
    } finally {
      setIsSummarizing(false);
    }
  };

  return (
    <section id="module-jd" className="module-pane active w-full h-[calc(100vh)] min-h-[400px] flex flex-col" aria-labelledby="jd-title">
      <div className="w-full h-full p-2 sm:p-4 flex flex-col">
          {!showEditor ? (
             <div className="flex flex-col items-center justify-center flex-1 w-full max-w-4xl mx-auto pt-2">

                 {/* Main Upload Area */}
                 <div className="w-full relative flex-1 flex flex-col items-center justify-center p-2 mb-4">
                    <div className="absolute inset-4 xl:inset-8 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none rounded-3xl" style={{ border: '1px dashed rgba(51, 65, 85, 0.6)' }}></div>
                    
                    <div className="relative z-10 w-full p-4 flex flex-col items-center justify-center text-center">
                        <div className="w-14 h-14 bg-[#1E293B]/80 rounded-2xl flex items-center justify-center mb-3 shadow-xl relative group">
                            <i className="fa-solid fa-file-arrow-up text-xl text-slate-300"></i>
                        </div>

                        <h3 className="text-xl font-bold text-white mb-1">Drag & Drop Job Description here</h3>
                        <p className="text-slate-500 mb-2 text-[10px]">or choose an option below</p>

                        <div className="flex gap-2.5 mb-6">
                            {['PDF', 'DOCX', 'PNG', 'JPG'].map(format => (
                                <span key={format} className="px-5 py-1.5 rounded-full bg-[#1A233A] text-slate-400 text-[10px] font-bold tracking-widest border border-slate-700/50 uppercase">
                                    {format}
                                </span>
                            ))}
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="relative group">
                                 <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl blur-lg opacity-40 group-hover:opacity-100 transition duration-300"></div>
                                 <button 
                                    onClick={() => document.getElementById('new-file-upload')?.click()}
                                    disabled={isOcrLoading || isSummarizing}
                                    className="relative px-6 py-3 bg-[#A855F7] hover:bg-[#9333EA] text-white text-sm font-semibold rounded-xl flex items-center gap-3 transition-colors shadow-lg shadow-purple-900/50"
                                 >
                                     <i className="fa-solid fa-cloud-arrow-up"></i>
                                     <span>Upload File</span>
                                 </button>
                                 <input 
                                    id="new-file-upload" 
                                    type="file" 
                                    className="hidden" 
                                    accept=".pdf,.docx,.png,.jpg,.jpeg"
                                    onChange={handleOcrFileChange}
                                 />
                            </div>

                            <span className="text-slate-500 text-sm font-medium mx-2 italic">or</span>

                            <button 
                                onClick={() => setShowEditor(true)}
                                className="px-6 py-3 bg-[#1A233A] hover:bg-[#25304B] text-slate-300 text-sm font-semibold rounded-xl flex items-center gap-3 border border-slate-700/50 transition-all shadow-sm"
                            >
                                <i className="fa-solid fa-pen-to-square"></i>
                                <span>Paste Job Description</span>
                            </button>
                            
                            <button 
                                onClick={handleGoogleDriveSelect}
                                disabled={isOcrLoading || isSummarizing}
                                className="w-[48px] h-[48px] bg-[#1A233A] hover:bg-[#0F9D58] hover:border-[#0F9D58] hover:text-white text-slate-400 rounded-xl flex items-center justify-center border border-slate-700/50 transition-all shadow-sm"
                                title="Tải từ Google Drive"
                            >
                                <i className="fa-brands fa-google-drive"></i>
                            </button>
                        </div>
                    </div>
                 </div>
                 
                 {/* AI info removed to save space */}


                 {(isOcrLoading || isSummarizing) && (
                     <div className="absolute top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-cyan-500/25 bg-[#0B1120]/92 px-8 py-6 shadow-2xl backdrop-blur-md">
                        <div className="flex flex-col items-center gap-3 text-center">
                          <div className="h-10 w-10 rounded-full border-4 border-slate-700 border-t-cyan-400 animate-spin" />
                          <span className="text-sm font-semibold text-slate-200">{ocrMessage || 'Đang xử lý...'}</span>
                        </div>
                     </div>
                 )}
                 
                 {(ocrError || summarizeError) && (
                     <div className="mt-6 flex items-center gap-3 text-red-400 bg-red-500/10 px-4 py-3 rounded-xl border border-red-500/20">
                         <i className="fa-solid fa-circle-exclamation text-lg"></i>
                         <span className="text-sm font-medium leading-relaxed">{ocrError || summarizeError}</span>
                     </div>
                 )}
                 </div>
          ) : (
             <div className="flex flex-col flex-1 w-full mx-auto animate-in fade-in zoom-in duration-300 h-full p-6 pt-2">
                {/* Inline Inputs Area */}
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-800/40">
                    <div className="flex items-center gap-2 flex-1 w-full mx-auto overflow-x-auto hide-scrollbar">
                         <div className="min-w-[160px] flex-1 flex items-center bg-[#0F172A] border border-slate-800 rounded-lg px-3 py-2 focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/30 transition-all group">
                             <i className="fa-solid fa-briefcase text-slate-500 text-xs group-focus-within:text-purple-400 transition-colors"></i>
                             <input type="text" placeholder="Job Position..." value={jobPosition} onChange={e => setJobPosition(e.target.value)} className="bg-transparent border-none outline-none text-[11px] font-medium text-slate-200 ml-2 w-full placeholder-slate-600" />
                         </div>
                         <div className="min-w-[140px] flex-1 flex items-center bg-[#0F172A] border border-slate-800 rounded-lg px-3 py-2 opacity-70 hover:opacity-100 transition-opacity">
                             <i className="fa-regular fa-building text-slate-500 text-xs"></i>
                             <input type="text" placeholder="Company..." className="bg-transparent border-none outline-none text-[11px] font-medium text-slate-200 ml-2 w-full placeholder-slate-600" />
                         </div>
                         <div className="min-w-[140px] flex-1 flex items-center bg-[#0F172A] border border-slate-800 rounded-lg px-3 py-2 opacity-70 hover:opacity-100 transition-opacity">
                             <i className="fa-solid fa-money-bill text-slate-500 text-xs"></i>
                             <input type="text" placeholder="Salary..." className="bg-transparent border-none outline-none text-[11px] font-medium text-slate-200 ml-2 w-full placeholder-slate-600" />
                         </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button 
                            onClick={handleSummarizeJD} 
                            disabled={isOcrLoading || isSummarizing || jdText.trim().length < 200} 
                            className="flex items-center justify-center w-8 h-8 bg-transparent hover:bg-slate-800/50 text-purple-400/80 hover:text-purple-400 rounded-lg transition-all disabled:opacity-50"
                            title="Optimize with AI"
                        >
                             <i className="fa-solid fa-wand-magic-sparkles"></i>
                        </button>
                        <button 
                            onClick={onComplete} 
                            disabled={!isCompleteEnabled} 
                            className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all ${isCompleteEnabled ? 'bg-slate-800 hover:bg-slate-700 text-white shadow-sm' : 'bg-slate-800/50 text-slate-600 cursor-not-allowed'}`}
                            title="Kế tiếp"
                        >
                             <i className="fa-solid fa-arrow-right text-xs"></i>
                        </button>
                    </div>
                </div>

                {/* JD Textarea Body */}
                <div className="flex-1 w-full flex flex-col relative h-full">
                     <textarea
                         className="flex-1 w-full bg-[#050B14] border border-slate-800/60 rounded-lg p-6 text-sm text-slate-300 leading-relaxed placeholder-slate-700 resize-none outline-none focus:border-indigo-500/30 transition-colors custom-scrollbar font-mono"
                         placeholder="Paste the Job Description here...&#10;&#10;Include role title, responsibilities, required skills, experience level, and any other relevant details."
                         value={jdText}
                         onChange={e => setJdText(e.target.value)}
                         spellCheck={false}
                     ></textarea>
                     
                     {isSummarizing && (
                         <div className="absolute top-6 right-6 flex items-center gap-2 rounded-xl border border-cyan-500/25 bg-[#0F172A] px-4 py-2 text-slate-200 shadow-2xl">
                             <div className="h-4 w-4 rounded-full border-2 border-slate-600 border-t-cyan-400 animate-spin" />
                             <span className="text-xs font-semibold tracking-wide">ĐANG TỐI ƯU JD...</span>
                         </div>
                     )}
                     <div className="absolute top-6 right-6 text-[10px] uppercase tracking-widest font-bold text-slate-600/50 pointer-events-none">
                         {characterCount > 0 && !isSummarizing ? `${characterCount} CHARS` : ''}
                     </div>

                     {(ocrMessage && !isOcrLoading && !isSummarizing) && (
                         <div className="absolute bottom-8 left-8 flex items-center gap-2 text-cyan-400 bg-[#0F172A] px-4 py-2 rounded-xl border border-cyan-500/30 shadow-2xl animate-in fade-in slide-in-from-bottom-2">
                             <i className="fa-solid fa-circle-check"></i>
                             <span className="text-sm font-medium">{ocrMessage}</span>
                         </div>
                     )}
                     
                     {(ocrError || summarizeError) && (
                         <div className="absolute bottom-8 left-8 flex items-center gap-3 text-red-400 bg-red-500/10 px-4 py-3 rounded-xl border border-red-500/20 shadow-2xl animate-in fade-in slide-in-from-bottom-2">
                             <i className="fa-solid fa-circle-exclamation text-lg"></i>
                             <span className="text-sm font-medium leading-relaxed">{ocrError || summarizeError}</span>
                         </div>
                     )}
                </div>
             </div>
          )}
      </div>
    </section>
  );
};

export default JDInput;