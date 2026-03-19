import React, { useMemo, useState, useCallback, memo } from 'react';
import type { HardFilters, WeightCriteria, MainCriterion } from '../../../assets/types';
import HardFilterPanel from '../../giao-dien/cau-hinh/HardFilterPanel';
import WeightTile from '../../giao-dien/cau-hinh/WeightTile';
import TotalWeightDisplay from '../../giao-dien/cau-hinh/TotalWeightDisplay';

interface WeightsConfigProps {
  weights: WeightCriteria;
  setWeights: React.Dispatch<React.SetStateAction<WeightCriteria>>;
  hardFilters: HardFilters;
  setHardFilters: React.Dispatch<React.SetStateAction<HardFilters>>;
  onComplete: () => void;
}

const WeightsConfig: React.FC<WeightsConfigProps> = memo(({ weights, setWeights, hardFilters, setHardFilters, onComplete }) => {
  const [expandedCriterion, setExpandedCriterion] = useState<string | null>(null);
  const [validationErrorFilters, setValidationErrorFilters] = useState<string | null>(null);
  const [validationErrorWeights, setValidationErrorWeights] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2>(1); // 1: Tiêu chí Lọc, 2: Phân bổ Trọng số

  const totalWeight = useMemo(() => {
    return Object.values(weights).reduce((total: number, criterion: MainCriterion) => {
      if (criterion.children) {
        return total + criterion.children.reduce((subTotal, child) => subTotal + child.weight, 0);
      }
      return total + (criterion.weight || 0);
    }, 0);
  }, [weights]);

  const remainingWeight = 100 - totalWeight;

  const weightStatus = useMemo(() => {
    if (totalWeight === 100) {
      return { label: 'Đầy đủ', desc: 'Tổng trọng số đạt 100%', tone: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' };
    }
    if (totalWeight > 100) {
      return { label: 'Vượt ngưỡng', desc: `Thừa ${Math.abs(remainingWeight)}%`, tone: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30' };
    }
    return { label: 'Chưa đủ', desc: `Thiếu ${Math.abs(remainingWeight)}%`, tone: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' };
  }, [remainingWeight, totalWeight]);

  const primaryCriteria = useMemo(() => {
    return Object.values(weights).filter((c: MainCriterion) => c.children) as MainCriterion[];
  }, [weights]);

  const validateFilters = useCallback((): boolean => {
    setValidationErrorFilters(null);
    const mandatoryFieldsForValidation = [
      { key: 'location', label: 'Địa điểm làm việc' },
      { key: 'minExp', label: 'Kinh nghiệm tối thiểu' },
      { key: 'seniority', label: 'Cấp độ' },
      { key: 'education', label: 'Học vấn' },
      { key: 'industry', label: 'Ngành nghề' },
      { key: 'language', label: 'Ngôn ngữ' },
      { key: 'certificates', label: 'Chứng chỉ' },
      { key: 'salary', label: 'Lương' },
      { key: 'workFormat', label: 'Hình thức làm việc' },
      { key: 'contractType', label: 'Hợp đồng' },
    ];
    const invalidField = mandatoryFieldsForValidation.find(field => {
      const mandatoryKey = `${field.key}Mandatory` as keyof HardFilters;
      if (!hardFilters[mandatoryKey]) return false;
      if (field.key === 'salary') return !hardFilters.salaryMin && !hardFilters.salaryMax;
      const valueKey = field.key as keyof HardFilters;
      return !hardFilters[valueKey];
    });
    if (invalidField) {
      setValidationErrorFilters(`Vui lòng điền giá trị cho tiêu chí bắt buộc: ${invalidField.label}.`);
      return false;
    }
    return true;
  }, [hardFilters]);

  const handleFiltersComplete = useCallback(() => {
    if (!validateFilters()) return;
    setStep(2);
  }, [validateFilters]);

  const handleWeightsComplete = useCallback(() => {
    setValidationErrorWeights(null);
    if (totalWeight !== 100) {
      setValidationErrorWeights('Tổng trọng số phải bằng 100% trước khi tiếp tục.');
      return;
    }
    onComplete();
  }, [totalWeight, onComplete]);

  // Calculate mandatory filter progress
  const mandatoryProgress = useMemo(() => {
    const keys = Object.keys(hardFilters).filter(k => k.endsWith('Mandatory')) as Array<keyof HardFilters>;
    const active = keys.filter(k => hardFilters[k]).length;
    const fulfilled = keys.filter(k => {
      if (!hardFilters[k]) return false;
      const valKey = k.replace('Mandatory', '') as keyof HardFilters;
      const val = hardFilters[valKey];
      return typeof val === 'string' ? val.trim().length > 0 : Boolean(val);
    }).length;
    return { active, fulfilled, percent: active ? Math.round((fulfilled / active) * 100) : 0 };
  }, [hardFilters]);

  return (
    <section id="module-weights" className="module-pane active relative w-full h-[calc(100vh)] min-h-[400px] flex flex-col bg-[#0B1120]">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Tab Switcher Area */}
      <div className="flex-none bg-[#0B1120] px-6 py-2 border-b border-slate-800/40">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setStep(1)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${step === 1 ? 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-md shadow-indigo-500/20' : 'bg-transparent text-slate-400 hover:text-slate-200 border border-slate-700/50 hover:border-slate-600'}`}
            >
              {step === 1 && <i className="fa-solid fa-check mr-0.5 text-[9px]"></i>}
              Bộ lọc
            </button>
            <i className="fa-solid fa-chevron-right text-[9px] text-slate-600"></i>
            <button
              onClick={() => { if (validateFilters()) setStep(2); }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${step === 2 ? 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-md shadow-indigo-500/20' : 'bg-transparent text-slate-400 hover:text-slate-200 border border-slate-700/50 hover:border-slate-600'}`}
            >
              <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] bg-black/20 text-white`}>2</span>
              Trọng số
            </button>
          </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden relative z-10 w-full h-[calc(100vh-8rem)]">
        {/* Left Column: Scrolling Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-transparent">
          <div className="w-full h-full p-4 lg:p-6 lg:px-8">
            {step === 1 ? (
              <HardFilterPanel hardFilters={hardFilters} setHardFilters={setHardFilters} />
            ) : (
              <div className="space-y-3">
                {primaryCriteria.map((criterion) => (
                  <WeightTile
                    key={criterion.key}
                    criterion={criterion}
                    setWeights={setWeights}
                    isExpanded={expandedCriterion === criterion.key}
                    onToggle={() =>
                      setExpandedCriterion((prev) => (prev === criterion.key ? null : criterion.key))
                    }
                  />
                ))}
              </div>
            )}
          </div>
        </div>
        {/* Right Column: Fixed Controls & Info */}
        <div className="w-[320px] lg:w-[380px] shrink-0 border-l border-slate-800/60 bg-slate-900/40 flex flex-col h-full relative z-10 shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.5)]">
          <div className="flex flex-col flex-1 h-full p-4 lg:p-6 overflow-y-auto custom-scrollbar">
            {step === 1 ? (
              <>
                <div className="flex-1">
                  <div className="bg-gradient-to-b from-slate-900/80 to-[#0A0F1C]/80 rounded-2xl p-6 border border-slate-700/50 mb-4 h-full shadow-xl backdrop-blur-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    
                    <h4 className="flex items-center gap-3 text-[11px] font-bold text-white mb-8 uppercase tracking-[0.2em]">
                      <div className="w-8 h-8 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                        <i className="fa-solid fa-list-check"></i>
                      </div>
                      Tiêu chí bắt buộc
                    </h4>

                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <div className="bg-[#0B1221] border border-slate-700/60 rounded-xl p-4 flex flex-col justify-center items-center shadow-lg relative isolate overflow-hidden group hover:border-slate-600 transition-colors">
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-slate-800/10 z-0"></div>
                        <span className="text-3xl font-black text-white mb-1 tracking-tighter relative z-10 group-hover:scale-110 transition-transform">{mandatoryProgress.active}</span>
                        <span className="text-[9px] text-slate-400 uppercase tracking-[0.2em] font-bold relative z-10">Đã Bật</span>
                      </div>
                      <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-4 flex flex-col justify-center items-center shadow-lg shadow-emerald-900/10 relative isolate overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-emerald-500/10 z-0"></div>
                        <span className="text-3xl font-black text-emerald-400 mb-1 tracking-tighter relative z-10 shadow-emerald-400/50 drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]">{mandatoryProgress.fulfilled}</span>
                        <span className="text-[9px] text-emerald-500 uppercase tracking-[0.2em] font-bold relative z-10">Hợp Lệ</span>
                      </div>
                    </div>

                    <div className="space-y-3 mb-8 pointer-events-none bg-slate-900/50 p-4 rounded-xl border border-slate-800/80">
                      <div className="flex justify-between text-[11px] font-bold tracking-[0.15em]">
                        <span className="text-slate-400 uppercase">Tiến trình</span>
                        <span className="text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]">{mandatoryProgress.percent}%</span>
                      </div>
                      <div className="h-2 bg-slate-950 rounded-full overflow-hidden shadow-inner border border-slate-800/50 relative">
                        <div className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 transition-all duration-700 ease-out shadow-[0_0_15px_rgba(99,102,241,0.6)] flex justify-end relative" style={{ width: `${mandatoryProgress.percent}%` }}>
                          <div className="absolute top-0 right-0 w-8 h-full bg-gradient-to-r from-transparent to-white/40 blur-[2px]"></div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-indigo-500/10 rounded-xl border border-indigo-500/20 shadow-[0_4px_20px_-10px_rgba(99,102,241,0.15)] relative overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500/50"></div>
                      <i className="fa-solid fa-circle-info mt-0.5 text-indigo-400 text-sm"></i>
                      <p className="text-[12px] text-indigo-200/80 leading-relaxed font-medium">
                        Tiêu chí được bật nhưng chưa điền giá trị sẽ bị <span className="text-white font-bold">bỏ qua</span> khi AI phân tích.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-auto space-y-4 pt-4 border-t border-slate-800/60 relative z-20">
                  <button
                    onClick={handleFiltersComplete}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-sm shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] transition-all flex items-center justify-center gap-3 border border-indigo-400/30 hover:-translate-y-0.5 group"
                  >
                    Tiếp theo <i className="fa-solid fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
                  </button>

                  {validationErrorFilters && (
                    <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-3 shadow-lg shadow-rose-500/10 animate-fade-in relative overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500/50"></div>
                      <i className="fa-solid fa-circle-exclamation text-rose-400 mt-0.5 text-sm"></i>
                      <p className="text-xs text-rose-200/90 font-medium leading-relaxed">{validationErrorFilters}</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="flex-1">
                  <div className="bg-gradient-to-b from-slate-900/80 to-[#0A0F1C]/80 rounded-2xl p-6 border border-slate-700/50 mb-4 shadow-xl backdrop-blur-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 cursor-default pointer-events-none"></div>

                    <h4 className="flex items-center gap-3 text-[11px] font-bold text-white mb-8 uppercase tracking-[0.2em]">
                      <div className="w-8 h-8 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                        <i className="fa-solid fa-percent"></i>
                      </div>
                      Tổng trọng số
                    </h4>

                    <div className="bg-[#0B1221] border border-slate-700/60 rounded-xl p-5 flex flex-col justify-center items-center relative overflow-hidden mb-6 shadow-[inset_0_2px_15px_rgba(0,0,0,0.3)] group h-36">
                      {/* bg decoration */}
                      <div className={`absolute top-0 right-0 w-32 h-32 blur-[40px] -translate-y-1/2 translate-x-1/2 rounded-full transition-colors duration-700 ${totalWeight === 100 ? 'bg-emerald-500/30' : totalWeight > 100 ? 'bg-rose-500/30' : 'bg-amber-500/30'}`}></div>
                      <div className={`absolute bottom-0 left-0 w-32 h-32 blur-[40px] translate-y-1/2 -translate-x-1/2 rounded-full transition-colors duration-700 ${totalWeight === 100 ? 'bg-emerald-500/20' : totalWeight > 100 ? 'bg-rose-500/20' : 'bg-amber-500/20'}`}></div>

                      <div className="flex items-baseline gap-1 relative z-10 transition-transform duration-500 group-hover:scale-110 group-hover:-translate-y-0.5">
                        <span className={`text-5xl font-black tracking-tighter transition-all duration-500 ${totalWeight === 100 ? 'text-white drop-shadow-[0_0_25px_rgba(16,185,129,0.5)]' : totalWeight > 100 ? 'text-white drop-shadow-[0_0_25px_rgba(244,63,94,0.6)]' : 'text-white drop-shadow-[0_0_25px_rgba(245,158,11,0.5)]'}`}>
                          {totalWeight}
                        </span>
                        <span className={`text-xl font-bold opacity-90 transition-colors duration-500 ${totalWeight === 100 ? 'text-emerald-300' : totalWeight > 100 ? 'text-rose-300' : 'text-amber-300'}`}>%</span>
                      </div>
                      <div className={`flex items-center gap-1.5 mt-3 text-[9px] font-bold uppercase tracking-[0.2em] relative z-10 bg-black/50 px-3 py-1 rounded-full backdrop-blur-md border shadow-md transition-all duration-500 ${totalWeight === 100 ? 'border-emerald-500/40 text-emerald-300 shadow-emerald-500/20' : totalWeight > 100 ? 'border-rose-500/40 text-rose-300 shadow-rose-500/20' : 'border-amber-500/40 text-amber-300 shadow-amber-500/20'}`}>
                        {totalWeight === 100 ? (
                          <><i className="fa-solid fa-circle-check"></i> Đủ 100%</>
                        ) : totalWeight > 100 ? (
                          <><i className="fa-solid fa-triangle-exclamation"></i> Thừa {Math.abs(100 - totalWeight)}%</>
                        ) : (
                          <><i className="fa-solid fa-circle-xmark"></i> Thiếu {Math.abs(100 - totalWeight)}%</>
                        )}
                      </div>
                    </div>

                    <TotalWeightDisplay totalWeight={totalWeight} />
                  </div>
                </div>

                <div className="mt-auto space-y-4 pt-4 border-t border-slate-800/60 relative z-20">
                  <button
                    onClick={handleWeightsComplete}
                    disabled={totalWeight !== 100}
                    className={`w-full py-4 rounded-xl font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-3 border group ${totalWeight === 100
                        ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-[0_0_25px_rgba(16,185,129,0.4)] border-emerald-400/40 hover:-translate-y-0.5 hover:shadow-[0_0_35px_rgba(16,185,129,0.5)]'
                        : 'bg-slate-800/60 text-slate-500 cursor-not-allowed border-slate-700/50'
                      }`}
                  >
                    <i className={`fa-solid fa-check text-xs transition-transform ${totalWeight === 100 ? 'group-hover:scale-125' : ''}`}></i> Hoàn tất cấu hình
                  </button>

                  <button
                    onClick={() => setStep(1)}
                    className="w-full py-3 flex items-center justify-center gap-3 text-[11px] font-bold text-slate-400 hover:text-white tracking-[0.2em] uppercase transition-all rounded-xl hover:bg-slate-800/60 border border-transparent hover:border-slate-700/50 group"
                  >
                    <i className="fa-solid fa-arrow-left group-hover:-translate-x-1 transition-transform"></i> Quay lại bộ lọc
                  </button>
                </div>

                {validationErrorWeights && (
                  <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-3 mt-4 shadow-lg shadow-rose-500/10 animate-fade-in relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500/50"></div>
                    <i className="fa-solid fa-circle-exclamation text-rose-400 mt-0.5 text-sm"></i>
                    <p className="text-[12px] text-rose-200/90 font-medium leading-relaxed">{validationErrorWeights}</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
});

WeightsConfig.displayName = 'WeightsConfig';

export default WeightsConfig;
