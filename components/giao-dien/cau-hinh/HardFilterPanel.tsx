import React, { useMemo } from 'react';
import type { HardFilters } from '../../../assets/types';

interface HardFilterPanelProps {
    hardFilters: HardFilters;
    setHardFilters: React.Dispatch<React.SetStateAction<HardFilters>>;
}

type MandatoryKey = Extract<keyof HardFilters, `${string}Mandatory`>;
type ValueKey = Exclude<keyof HardFilters, MandatoryKey>;

const HardFilterPanel: React.FC<HardFilterPanelProps> = ({ hardFilters, setHardFilters }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { id, value } = e.target;
        setHardFilters((prev) => ({
            ...prev,
            [id]: value,
        }));
    };

    const handleMandatoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, checked } = e.target;
        setHardFilters((prev) => ({
            ...prev,
            [id]: checked,
        }));
    };

    const hasValue = (val: unknown) => {
        if (typeof val === 'string') return val.trim().length > 0;
        return Boolean(val);
    };

    const inputClasses = (isMandatory: boolean, valuePresent: boolean) =>
        `w-full bg-[#0A0F1C]/80 border backdrop-blur-sm rounded-xl px-4 py-3 text-xs text-slate-200 placeholder-slate-500/70 transition-all duration-300 focus:outline-none focus:ring-4 appearance-none shadow-inner ${
            isMandatory
                ? valuePresent
                    ? 'border-indigo-500/40 hover:border-indigo-400 focus:border-indigo-400 focus:ring-indigo-500/10'
                    : 'border-rose-500/40 bg-rose-500/5 hover:border-rose-500 focus:border-rose-400 focus:ring-rose-500/10'
                : 'border-slate-700/60 hover:border-slate-600 focus:border-indigo-500/50 focus:ring-indigo-500/10'
        }`;

    const selectFieldConfigs: Array<{
        id: ValueKey;
        label: string;
        placeholder: string;
        mandatoryKey: MandatoryKey;
        icon: string;
        color: string;
        options: { value: string; label: string }[];
    }> = [
        {
            id: 'location',
            label: 'ĐỊA ĐIỂM',
            placeholder: 'Chọn địa điểm',
            mandatoryKey: 'locationMandatory',
            icon: 'fa-solid fa-location-dot',
            color: 'text-indigo-400',
            options: [
                { value: '', label: 'Không yêu cầu' },
                { value: 'Hà Nội', label: 'Hà Nội' },
                { value: 'Hải Phòng', label: 'Hải Phòng' },
                { value: 'Đà Nẵng', label: 'Đà Nẵng' },
                { value: 'Thành phố Hồ Chí Minh', label: 'TP. Hồ Chí Minh' },
                { value: 'Remote', label: 'Remote' },
            ],
        },
        {
            id: 'minExp',
            label: 'KINH NGHIỆM TỐI THIỂU',
            placeholder: 'Không yêu cầu',
            mandatoryKey: 'minExpMandatory',
            icon: 'fa-solid fa-clock-rotate-left',
            color: 'text-purple-400',
            options: [
                { value: '', label: 'Không yêu cầu' },
                { value: '1', label: '1 năm' },
                { value: '2', label: '2 năm' },
                { value: '3', label: '3 năm' },
                { value: '5', label: '5 năm' },
            ],
        },
        {
            id: 'seniority',
            label: 'CẤP BẬC & SENIORITY',
            placeholder: 'Không yêu cầu',
            mandatoryKey: 'seniorityMandatory',
            icon: 'fa-solid fa-layer-group',
            color: 'text-indigo-400',
            options: [
                { value: '', label: 'Không yêu cầu' },
                { value: 'Intern', label: 'Intern' },
                { value: 'Junior', label: 'Junior' },
                { value: 'Mid-level', label: 'Mid-level' },
                { value: 'Senior', label: 'Senior' },
                { value: 'Lead', label: 'Lead' },
            ],
        },
        {
            id: 'workFormat',
            label: 'HÌNH THỨC LÀM VIỆC',
            placeholder: 'Không yêu cầu',
            mandatoryKey: 'workFormatMandatory',
            icon: 'fa-solid fa-building',
            color: 'text-sky-400',
            options: [
                { value: '', label: 'Không yêu cầu' },
                { value: 'Onsite', label: 'Onsite' },
                { value: 'Hybrid', label: 'Hybrid' },
                { value: 'Remote', label: 'Remote' },
            ],
        },
        {
            id: 'contractType',
            label: 'LOẠI HỢP ĐỒNG',
            placeholder: 'Không yêu cầu',
            mandatoryKey: 'contractTypeMandatory',
            icon: 'fa-solid fa-file-contract',
            color: 'text-emerald-400',
            options: [
                { value: '', label: 'Không yêu cầu' },
                { value: 'Full-time', label: 'Full-time' },
                { value: 'Part-time', label: 'Part-time' },
                { value: 'Intern', label: 'Intern' },
                { value: 'Contract', label: 'Contract' },
            ],
        },
    ];

    const renderToggle = (id: string, isChecked: boolean, label: string = 'BẮT BUỘC') => (
        <div className="flex items-center gap-2.5">
            <label htmlFor={id} className={`text-[10px] font-bold tracking-[0.2em] cursor-pointer transition-colors duration-300 ${isChecked ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-400'}`}>
                {label}
            </label>
            <div className="relative inline-block w-9 align-middle select-none transition duration-200 ease-in group">
                <input 
                    type="checkbox" 
                    id={id} 
                    checked={isChecked}
                    onChange={handleMandatoryChange}
                    className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer transition-all duration-300 ease-in-out border-transparent top-0.5 peer shadow-[0_2px_5px_rgba(0,0,0,0.2)]" 
                    style={{ 
                        transform: isChecked ? 'translateX(100%)' : 'translateX(0)', 
                        zIndex: 10, 
                        left: isChecked ? '-2px' : '2px',
                        boxShadow: isChecked ? '0 0 10px rgba(99,102,241,0.6)' : ''
                    }}
                />
                <label 
                    htmlFor={id} 
                    className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer transition-all duration-300 ease-in-out border ${isChecked ? 'bg-indigo-500/80 border-indigo-400 shadow-[inset_0_0_10px_rgba(0,0,0,0.2)]' : 'bg-slate-800 border-slate-700 group-hover:bg-slate-700'}`}
                ></label>
            </div>
        </div>
    );

    const renderCompactField = (config: (typeof selectFieldConfigs)[number]) => {
        const isMandatory = hardFilters[config.mandatoryKey];
        const hasCurrentValue = hasValue(hardFilters[config.id]);
        
        return (
            <div key={config.id} className={`relative isolate flex flex-col gap-3 p-4 rounded-xl border transition-all duration-300 overflow-hidden group ${
                isMandatory 
                ? 'border-indigo-500/40 bg-indigo-950/20 shadow-[0_4px_20px_-10px_rgba(99,102,241,0.2)] hover:border-indigo-400/60 hover:bg-indigo-950/30 rotate-0' 
                : 'border-slate-800/80 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-800/50 hover:shadow-md'
            }`}>
                {/* Glow effect on hover */}
                {isMandatory && (
                    <div className="absolute top-0 right-0 -mr-6 -mt-6 w-16 h-16 rounded-full bg-indigo-500/20 blur-xl pointer-events-none transition-opacity duration-300 opacity-50 group-hover:opacity-100"></div>
                )}
                {isMandatory && (
                    <div className="absolute top-0 left-0 w-full h-[1.5px] bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 opacity-70"></div>
                )}

                <div className="flex items-center justify-between z-10">
                    <label htmlFor={config.id} className="text-[11px] font-bold text-slate-200 tracking-wider flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-300 ${
                            isMandatory ? 'bg-indigo-500/20 text-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.15)] ring-1 ring-inset ring-indigo-500/30' : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-slate-300 ring-1 ring-inset ring-slate-700/50'
                        }`}>
                            <i className={`${config.icon} text-xs`}></i>
                        </div>
                        {config.label}
                    </label>
                    {renderToggle(config.mandatoryKey, Boolean(isMandatory))}
                </div>
                <div className="relative z-10 w-full">
                    <select
                        id={config.id}
                        value={hardFilters[config.id]}
                        onChange={handleChange}
                        className={inputClasses(Boolean(isMandatory), hasCurrentValue)}
                    >
                        {config.options.map((option) => (
                            <option key={option.value ?? option.label} value={option.value} className="bg-slate-900 text-slate-200">
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none w-4 h-4 flex items-center justify-center rounded bg-slate-800/50">
                        <i className="fa-solid fa-chevron-down text-[9px] text-slate-400"></i>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6 pb-10 w-full animate-fade-in">
            {/* Elegant Header Card */}
            <div className="relative overflow-hidden flex items-start gap-4 p-5 rounded-xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/40 to-slate-900/60 shadow-lg">
                 <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none translate-x-1/3 -translate-y-1/3"></div>
                 <div className="absolute bottom-0 left-6 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none translate-y-1/2"></div>
                 
                 <div className="relative z-10 flex items-start gap-4">
                     <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.2)] shrink-0">
                         <i className="fa-solid fa-filter text-base text-indigo-300"></i>
                     </div>
                     <div className="mt-0.5">
                         <h4 className="text-[13px] font-bold text-white mb-1 tracking-wide flex items-center gap-2">
                            Bộ lọc cứng (Hard Filters)
                            <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-[8px] text-indigo-300 border border-indigo-500/30 uppercase tracking-widest font-bold">Quan trọng</span>
                         </h4>
                         <p className="text-[11px] text-slate-400 leading-relaxed max-w-2xl">
                            Thiết lập các điều kiện tiên quyết. Hồ sơ không đáp ứng các tiêu chí được chọn là <span className="text-indigo-400 font-semibold">Bắt Buộc</span> sẽ bị AI từ chối.
                         </p>
                     </div>
                 </div>
            </div>

            {/* Group 1: Basic Info */}
            <div className="relative">
                <div className="flex items-center gap-3 mb-4 sticky top-0 bg-[#0B1120]/90 backdrop-blur-md z-20 py-2">
                     <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600/50 flex items-center justify-center text-slate-300 shadow-sm shadow-black/20">
                         <i className="fa-solid fa-briefcase text-[10px]"></i>
                     </div>
                     <h5 className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.15em] whitespace-nowrap drop-shadow-sm">Điều kiện cơ bản</h5>
                     <div className="h-px w-full bg-gradient-to-r from-slate-800 via-slate-800/50 to-transparent"></div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {selectFieldConfigs.map((config) => renderCompactField(config))}
                </div>
            </div>

            {/* Group 2: Context & Quality */}
            <div className="relative">
                <div className="flex items-center gap-3 mb-4 sticky top-0 bg-[#0B1120]/90 backdrop-blur-md z-20 py-2">
                     <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600/50 flex items-center justify-center text-slate-300 shadow-sm shadow-black/20">
                         <i className="fa-solid fa-layer-group text-[10px]"></i>
                     </div>
                     <h5 className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.15em] whitespace-nowrap drop-shadow-sm">Chuyên môn & Yêu cầu</h5>
                     <div className="h-px w-full bg-gradient-to-r from-slate-800 via-slate-800/50 to-transparent"></div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Industry */}
                    <div className={`relative isolate flex flex-col gap-3 p-4 rounded-xl border transition-all duration-300 overflow-hidden group ${hardFilters.industryMandatory ? 'border-indigo-500/40 bg-indigo-950/20 shadow-[0_4px_20px_-10px_rgba(99,102,241,0.2)] hover:border-indigo-400/60 hover:bg-indigo-950/30' : 'border-slate-800/80 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-800/50 hover:shadow-md'}`}>
                        {hardFilters.industryMandatory && <div className="absolute top-0 left-0 w-full h-[1.5px] bg-gradient-to-r from-indigo-500 to-purple-500 opacity-70"></div>}
                        <div className="flex items-center justify-between z-10">
                            <label htmlFor="industry" className="text-[11px] font-bold text-slate-200 tracking-wider flex items-center gap-2.5">
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-300 ${hardFilters.industryMandatory ? 'bg-indigo-500/20 text-indigo-400 ring-1 ring-inset ring-indigo-500/30' : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-slate-300 ring-1 ring-inset ring-slate-700/50'}`}>
                                    <i className="fa-solid fa-industry text-[11px]"></i>
                                </div>
                                NGÀNH NGHỀ
                            </label>
                            {renderToggle('industryMandatory', Boolean(hardFilters.industryMandatory))}
                        </div>
                        <input
                            type="text"
                            id="industry"
                            value={hardFilters.industry}
                            onChange={handleChange}
                            placeholder="Ví dụ: Fintech, SaaS, E-commerce..."
                            className={inputClasses(hardFilters.industryMandatory, hasValue(hardFilters.industry))}
                        />
                    </div>

                    {/* Language (Merged cell layout) */}
                    <div className={`relative isolate flex flex-col gap-3 p-4 rounded-xl border transition-all duration-300 overflow-hidden group ${hardFilters.languageMandatory ? 'border-indigo-500/40 bg-indigo-950/20 shadow-[0_4px_20px_-10px_rgba(99,102,241,0.2)] hover:border-indigo-400/60 hover:bg-indigo-950/30' : 'border-slate-800/80 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-800/50 hover:shadow-md'}`}>
                        {hardFilters.languageMandatory && <div className="absolute top-0 left-0 w-full h-[1.5px] bg-gradient-to-r from-indigo-500 to-purple-500 opacity-70"></div>}
                        <div className="flex items-center justify-between z-10">
                            <label htmlFor="language" className="text-[11px] font-bold text-slate-200 tracking-wider flex items-center gap-2.5">
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-300 ${hardFilters.languageMandatory ? 'bg-indigo-500/20 text-indigo-400 ring-1 ring-inset ring-indigo-500/30' : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-slate-300 ring-1 ring-inset ring-slate-700/50'}`}>
                                    <i className="fa-solid fa-language text-[11px]"></i>
                                </div>
                                NGÔN NGỮ
                            </label>
                            {renderToggle('languageMandatory', Boolean(hardFilters.languageMandatory))}
                        </div>
                        <div className="grid grid-cols-[1fr_90px] gap-2.5 relative z-10">
                            <input
                                type="text"
                                id="language"
                                value={hardFilters.language}
                                onChange={handleChange}
                                placeholder="Tên ngôn ngữ"
                                className={inputClasses(hardFilters.languageMandatory, hasValue(hardFilters.language))}
                            />
                            <div className="relative h-full">
                                <select
                                    id="languageLevel"
                                    value={hardFilters.languageLevel}
                                    onChange={handleChange}
                                    className={`${inputClasses(false, hasValue(hardFilters.languageLevel))} h-full pl-2 pr-6 text-[11px]`}
                                >
                                    <option value="" className="bg-slate-900 text-slate-400">Độ</option>
                                    <option value="B1" className="bg-slate-900 text-slate-200">B1</option>
                                    <option value="B2" className="bg-slate-900 text-slate-200">B2</option>
                                    <option value="C1" className="bg-slate-900 text-slate-200">C1</option>
                                    <option value="C2" className="bg-slate-900 text-slate-200">C2</option>
                                </select>
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none w-4 h-4 flex items-center justify-center rounded bg-slate-800/50">
                                    <i className="fa-solid fa-chevron-down text-[9px] text-slate-400"></i>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Education */}
                    <div className={`relative isolate flex flex-col gap-3 p-4 rounded-xl border transition-all duration-300 overflow-hidden group ${hardFilters.educationMandatory ? 'border-indigo-500/40 bg-indigo-950/20 shadow-[0_4px_20px_-10px_rgba(99,102,241,0.2)] hover:border-indigo-400/60 hover:bg-indigo-950/30' : 'border-slate-800/80 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-800/50 hover:shadow-md'}`}>
                        {hardFilters.educationMandatory && <div className="absolute top-0 left-0 w-full h-[1.5px] bg-gradient-to-r from-indigo-500 to-purple-500 opacity-70"></div>}
                        <div className="flex items-center justify-between z-10">
                            <label htmlFor="education" className="text-[11px] font-bold text-slate-200 tracking-wider flex items-center gap-2.5">
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-300 ${hardFilters.educationMandatory ? 'bg-indigo-500/20 text-indigo-400 ring-1 ring-inset ring-indigo-500/30' : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-slate-300 ring-1 ring-inset ring-slate-700/50'}`}>
                                    <i className="fa-solid fa-graduation-cap text-[11px]"></i>
                                </div>
                                HỌC VẤN / NGÀNH
                            </label>
                            {renderToggle('educationMandatory', Boolean(hardFilters.educationMandatory))}
                        </div>
                        <div className="relative z-10">
                            <select
                                id="education"
                                value={hardFilters.education}
                                onChange={handleChange}
                                className={inputClasses(hardFilters.educationMandatory, hasValue(hardFilters.education))}
                            >
                                <option value="" className="bg-slate-900 text-slate-400">Không yêu cầu</option>
                                <option value="High School" className="bg-slate-900">Tốt nghiệp THPT</option>
                                <option value="Associate" className="bg-slate-900">Cao đẳng</option>
                                <option value="Bachelor" className="bg-slate-900">Cử nhân</option>
                                <option value="Master" className="bg-slate-900">Thạc sĩ</option>
                                <option value="PhD" className="bg-slate-900">Tiến sĩ</option>
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none w-4 h-4 flex items-center justify-center rounded bg-slate-800/50">
                                <i className="fa-solid fa-chevron-down text-[9px] text-slate-400"></i>
                            </div>
                        </div>
                    </div>

                    {/* Certificates */}
                    <div className={`relative isolate flex flex-col gap-3 p-4 rounded-xl border transition-all duration-300 overflow-hidden group ${hardFilters.certificatesMandatory ? 'border-indigo-500/40 bg-indigo-950/20 shadow-[0_4px_20px_-10px_rgba(99,102,241,0.2)] hover:border-indigo-400/60 hover:bg-indigo-950/30' : 'border-slate-800/80 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-800/50 hover:shadow-md'}`}>
                        {hardFilters.certificatesMandatory && <div className="absolute top-0 left-0 w-full h-[1.5px] bg-gradient-to-r from-indigo-500 to-purple-500 opacity-70"></div>}
                        <div className="flex items-center justify-between z-10">
                            <label htmlFor="certificates" className="text-[11px] font-bold text-slate-200 tracking-wider flex items-center gap-2.5">
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-300 ${hardFilters.certificatesMandatory ? 'bg-indigo-500/20 text-indigo-400 ring-1 ring-inset ring-indigo-500/30' : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-slate-300 ring-1 ring-inset ring-slate-700/50'}`}>
                                    <i className="fa-solid fa-award text-[11px]"></i>
                                </div>
                                CHỨNG CHỈ
                            </label>
                            {renderToggle('certificatesMandatory', Boolean(hardFilters.certificatesMandatory))}
                        </div>
                        <input
                            type="text"
                            id="certificates"
                            value={hardFilters.certificates}
                            onChange={handleChange}
                            placeholder="Ví dụ: PMP, AWS, IELTS..."
                            className={inputClasses(hardFilters.certificatesMandatory, hasValue(hardFilters.certificates))}
                        />
                    </div>
                </div>
            </div>
            
            {/* Specific extra for Salary (based on the design) */}
            <div className="relative mt-6">
                <div className="flex items-center gap-3 mb-4 sticky top-0 bg-[#0B1120]/90 backdrop-blur-md z-20 py-2">
                     <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-amber-700/80 to-amber-900/80 border border-amber-600/50 flex items-center justify-center text-amber-300 shadow-sm shadow-amber-900/20">
                         <i className="fa-solid fa-coins text-[10px]"></i>
                     </div>
                     <h5 className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.15em] whitespace-nowrap drop-shadow-sm">Mức lương</h5>
                     <div className="h-px w-full bg-gradient-to-r from-slate-800 via-slate-800/50 to-transparent"></div>
                </div>
                <div className={`relative isolate flex flex-col gap-3 p-4 rounded-xl border transition-all duration-300 overflow-hidden group ${hardFilters.salaryMandatory ? 'border-amber-500/40 bg-amber-950/20 shadow-[0_4px_20px_-10px_rgba(245,158,11,0.15)] hover:border-amber-400/60 hover:bg-amber-950/30' : 'border-slate-800/80 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-800/50 hover:shadow-md'}`}>
                     {hardFilters.salaryMandatory && <div className="absolute top-0 right-0 -mr-6 -mt-6 w-16 h-16 rounded-full bg-amber-500/10 blur-xl pointer-events-none transition-opacity duration-300 opacity-50 group-hover:opacity-100"></div>}
                     {hardFilters.salaryMandatory && <div className="absolute top-0 left-0 w-full h-[1.5px] bg-gradient-to-r from-amber-500 to-orange-500 opacity-70"></div>}
                     
                     <div className="flex items-center justify-between z-10 w-full lg:w-1/2">
                        <label htmlFor="salary" className="text-[11px] font-bold text-slate-200 tracking-wider flex items-center gap-2.5">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-300 ${hardFilters.salaryMandatory ? 'bg-amber-500/20 text-amber-400 ring-1 ring-inset ring-amber-500/30' : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-slate-300 ring-1 ring-inset ring-slate-700/50'}`}>
                                <i className="fa-solid fa-wallet text-[11px]"></i>
                            </div>
                            KHOẢNG LƯƠNG (VNĐ)
                        </label>
                        {renderToggle('salaryMandatory', Boolean(hardFilters.salaryMandatory))}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-0.5 relative z-10">
                        <div className="space-y-1.5">
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">Từ</span>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium select-none pointer-events-none text-xs">₫</span>
                                <input
                                    type="number"
                                    id="salaryMin"
                                    value={hardFilters.salaryMin || ''}
                                    onChange={handleChange}
                                    placeholder="0"
                                    className={`${inputClasses(hardFilters.salaryMandatory, hasValue(hardFilters.salaryMin))} pl-7`}
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">Đến</span>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium select-none pointer-events-none text-xs">₫</span>
                                <input
                                    type="number"
                                    id="salaryMax"
                                    value={hardFilters.salaryMax || ''}
                                    onChange={handleChange}
                                    placeholder="Không giới hạn"
                                    className={`${inputClasses(hardFilters.salaryMandatory, hasValue(hardFilters.salaryMax))} pl-7`}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HardFilterPanel;