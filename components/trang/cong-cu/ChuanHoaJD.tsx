import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import './ChuanHoaJD.css';

// Declare libraries from CDN - these need to be loaded externally
declare var jspdf: any;
declare var docx: any;
declare var saveAs: any;
declare var pdfjsLib: any;
declare var mammoth: any;

type FileStatus = 'processing' | 'success' | 'error';
interface FileState {
    name: string;
    status: FileStatus;
    message?: string;
}
type ToastState = { message: string; type: 'success' | 'error' } | null;

// Script loader for external dependencies
const loadScript = (src: string, id: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (document.getElementById(id)) {
            resolve();
            return;
        }
        const script = document.createElement('script');
        script.id = id;
        script.src = src;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load ${src}`));
        document.head.appendChild(script);
    });
};

const ChuanHoaJD: React.FC = () => {
    const [rawJd, setRawJd] = useState<string>('');
    const [standardizedJd, setStandardizedJd] = useState<any | null>(null);
    const [supplementaryJd, setSupplementaryJd] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [scriptsLoaded, setScriptsLoaded] = useState<boolean>(false);

    // States for file handling
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [files, setFiles] = useState<FileState[]>([]);
    const [appendContent, setAppendContent] = useState<boolean>(false);
    const [isProcessingFiles, setIsProcessingFiles] = useState<boolean>(false);
    const [toast, setToast] = useState<ToastState>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // States for multi-step navigation
    const [currentStep, setCurrentStep] = useState<number>(1);
    const [showAnalysis, setShowAnalysis] = useState<boolean>(false);

    // State for platform standardizer
    const [selectedPlatform, setSelectedPlatform] = useState<string>('topcv');

    // Load external scripts on mount
    useEffect(() => {
        const loadDependencies = async () => {
            try {
                await Promise.all([
                    loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js', 'pdfjs'),
                    loadScript('https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js', 'mammoth'),
                    loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js', 'jspdf'),
                    loadScript('https://unpkg.com/docx@8.5.0/build/index.js', 'docx'),
                    loadScript('https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js', 'filesaver'),
                ]);

                // Set PDF.js worker
                if (typeof pdfjsLib !== 'undefined') {
                    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
                }

                setScriptsLoaded(true);
            } catch (err) {
                console.error('Failed to load dependencies:', err);
                setError('Không thể tải các thư viện cần thiết. Vui lòng tải lại trang.');
            }
        };

        loadDependencies();
    }, []);

    useEffect(() => {
        const hash = window.location.hash;
        const step = hash.includes('step') ? parseInt(hash.replace('#step', '')) : 1;

        if (sessionStorage.getItem('standardizedJd')) {
            setStandardizedJd(JSON.parse(sessionStorage.getItem('standardizedJd')!));
            setSupplementaryJd(JSON.parse(sessionStorage.getItem('supplementaryJd')!));
            setRawJd(sessionStorage.getItem('rawJd')!);
            setCurrentStep(step > 1 ? step : 1);
            if (step > 1) {
                setShowAnalysis(true);
            }
        }
    }, []);


    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    useEffect(() => {
        if (rawJd.trim() || files.length > 0) {
             if(standardizedJd) sessionStorage.setItem('standardizedJd', JSON.stringify(standardizedJd));
             if(supplementaryJd) sessionStorage.setItem('supplementaryJd', JSON.stringify(supplementaryJd));
             sessionStorage.setItem('rawJd', rawJd);
        } else {
            sessionStorage.removeItem('standardizedJd');
            sessionStorage.removeItem('supplementaryJd');
            sessionStorage.removeItem('rawJd');
        }
    }, [rawJd, files, standardizedJd, supplementaryJd]);

    // Reset to initial state if raw JD is cleared
    useEffect(() => {
        if (!rawJd.trim() && files.length === 0) {
            setStandardizedJd(null);
            setSupplementaryJd(null);
            setShowAnalysis(false);
            setCurrentStep(1);
        }
    }, [rawJd, files]);


    const jdSchema = {
        type: Type.OBJECT,
        properties: {
            jobTitle: { type: Type.STRING, description: "Tên vị trí công việc." },
            company: { type: Type.STRING, description: "Tên công ty. Nếu không có, trả về chuỗi rỗng." },
            jobDescription: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Danh sách các đầu việc, trách nhiệm chính trong phần 'Mô tả công việc'.",
            },
            jobRequirements: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Danh sách các yêu cầu về kỹ năng, kinh nghiệm, bằng cấp trong phần 'Yêu cầu công việc'.",
            },
            salary: { type: Type.STRING, description: "Mức lương. Nếu không có, trả về chuỗi rỗng." },
            benefits: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Danh sách các quyền lợi." },
            skills: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Danh sách các kỹ năng cần có (tin học, giao tiếp, ngoại ngữ...)." },
            experience: { type: Type.STRING, description: "Kinh nghiệm tối thiểu (số năm, lĩnh vực...). Nếu không có, trả về chuỗi rỗng." },
            educationLevel: { type: Type.STRING, description: "Trình độ học vấn yêu cầu. Nếu không có, trả về chuỗi rỗng." },
            preferredMajor: { type: Type.STRING, description: "Chuyên ngành ưu tiên. Nếu không có, trả về chuỗi rỗng." },
        },
    };

    const fileToGenerativePart = async (file: File) => {
        const base64EncodedDataPromise = new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
            reader.readAsDataURL(file);
        });
        return {
            inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
        };
    };

    const formatJdText = async (rawText: string): Promise<string> => {
        if (!rawText.trim()) return '';

        try {
            const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_CHUANHOA_JD_API_KEY || '' });
            const prompt = `Dưới đây là văn bản được trích xuất từ một tài liệu mô tả công việc (JD). Nhiệm vụ của bạn là dọn dẹp và định dạng lại nó thành một JD chuyên nghiệp, rõ ràng. Hãy tuân thủ nghiêm ngặt các quy tắc sau:
1. Loại bỏ các ký tự không cần thiết như dấu hoa thị (*, **), gạch đầu dòng không nhất quán và các ngắt dòng thừa.
2. Sử dụng định dạng tiêu đề IN HOA cho các mục chính.
3. Cấu trúc lại văn bản theo các mục sau (giữ nguyên tiêu đề mục ngay cả khi không tìm thấy nội dung cho mục đó):
   - THÔNG TIN DOANH NGHIỆP
   - THÔNG TIN TÀI LIỆU
   - I. MÔ TẢ CÔNG VIỆC
   - II. YÊU CẦU CÔNG VIỆC
   - III. QUYỀN LỢI
   - IV. THÔNG TIN KHÁC
4. Sử dụng gạch đầu dòng ('- ') cho các danh sách bên trong mỗi mục.
5. QUAN TRỌNG: Giữ nguyên và không thay đổi bất kỳ thông tin quan trọng nào như tên vị trí, tên công ty, số điện thoại, email, địa chỉ, và ngày tháng.
6. Văn bản cuối cùng phải sạch sẽ, dễ đọc, không viết hoa toàn bộ (trừ tiêu đề) và dễ dàng sao chép.

Nội dung văn bản thô:
"""
${rawText}
"""`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    temperature: 0.2,
                }
            });
            return response.text || '';
        } catch (error) {
            console.error("Lỗi khi định dạng JD:", error);
            setToast({ message: 'Không thể định dạng JD, văn bản gốc đã được sử dụng.', type: 'error' });
            return rawText;
        }
    };


    const processFile = async (file: File, index: number) => {
        const updateFileStatus = (status: FileStatus, message?: string) => {
            setFiles(prev => prev.map((f, i) => i === index ? { ...f, status, message } : f));
        };

        try {
            updateFileStatus('processing', 'Đang trích xuất...');
            const fileExtension = file.name.split('.').pop()?.toLowerCase();
            let extractedText = '';

            if (['png', 'jpg', 'jpeg'].includes(fileExtension || '')) {
                const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_CHUANHOA_JD_API_KEY || '' });
                const imagePart = await fileToGenerativePart(file);
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: { parts: [{ text: "Trích xuất toàn bộ văn bản từ hình ảnh này. Giữ nguyên định dạng và đảm bảo email, số điện thoại chính xác." }, imagePart] },
                });
                extractedText = response.text || '';
                if (!extractedText.trim()) {
                    setToast({ message: `Chất lượng OCR thấp cho file: ${file.name}`, type: 'error' });
                }
            } else if (fileExtension === 'pdf') {
                const arrayBuffer = await file.arrayBuffer();
                const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    extractedText += textContent.items.map((item: any) => item.str).join(' ') + '\n';
                }
            } else if (fileExtension === 'docx') {
                const arrayBuffer = await file.arrayBuffer();
                const result = await mammoth.extractRawText({ arrayBuffer });
                extractedText = result.value;
            } else {
                throw new Error("Định dạng file không được hỗ trợ.");
            }

            let finalText = extractedText;
            if (extractedText.trim()) {
                updateFileStatus('processing', 'Đang chuẩn hoá...');
                finalText = await formatJdText(extractedText);
            }

            setRawJd(prev => {
                if(appendContent) {
                    return prev ? `${prev}\n\n--- ${file.name} ---\n\n${finalText}` : finalText;
                }
                return finalText;
            });
            updateFileStatus('success', 'Hoàn thành');
            setToast({ message: `Trích xuất & chuẩn hoá thành công: ${file.name}`, type: 'success' });

        } catch (err: any) {
            console.error(`Lỗi xử lý file ${file.name}:`, err);
            updateFileStatus('error', err.message || 'Xử lý file thất bại.');
            setToast({ message: `Lỗi xử lý file: ${file.name}`, type: 'error' });
        }
    };

    const handleFiles = async (selectedFiles: FileList) => {
        const newFiles: File[] = Array.from(selectedFiles).filter(file => {
            if (file.size > 10 * 1024 * 1024) {
                 setToast({ message: `File ${file.name} quá lớn (> 10MB).`, type: 'error' });
                return false;
            }
            const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/png', 'image/jpeg'];
            if (!allowedTypes.includes(file.type)) {
                 setToast({ message: `Định dạng file ${file.name} không được hỗ trợ.`, type: 'error' });
                return false;
            }
            return true;
        });

        if (newFiles.length === 0) return;

        if (!appendContent) {
            setRawJd('');
            setFiles([]);
            setStandardizedJd(null);
            setSupplementaryJd(null);
            setShowAnalysis(false);
        }

        const initialFileStates = newFiles.map(f => ({ name: f.name, status: 'processing' as FileStatus, message: 'Chờ xử lý...' }));
        const startIndex = files.length;
        setFiles(prev => [...prev, ...initialFileStates]);

        setIsProcessingFiles(true);
        await Promise.all(newFiles.map((file, i) => processFile(file, startIndex + i)));
        setIsProcessingFiles(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFiles(e.dataTransfer.files);
            e.dataTransfer.clearData();
        }
    };

    const handleStandardize = async () => {
        if (!rawJd.trim()) {
            setError("Vui lòng nhập mô tả công việc hoặc tải file lên.");
            return;
        }
        setIsLoading(true);
        setError('');
        setStandardizedJd(null);
        setSupplementaryJd(null);
        setShowAnalysis(true); // Show the placeholder immediately

        try {
            const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_CHUANHOA_JD_API_KEY || '' });
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: `Phân tích JD sau đây và trích xuất thông tin chi tiết theo schema đã cho.
Cố gắng điền vào tất cả các trường, bao gồm Mức lương, Quyền lợi, Kỹ năng, Kinh nghiệm và Học vấn.
Nếu một trường không có thông tin, hãy để trống hoặc trả về một mảng rỗng.
JD: """${rawJd}"""`,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: jdSchema,
                },
            });

            const jsonText = (response.text || '').trim();
            const parsedJson = JSON.parse(jsonText);
            setStandardizedJd(parsedJson);
            // Initialize supplementary JD with empty values for Step 2
            setSupplementaryJd({
                salary: '',
                benefits: '',
                skills: '',
                experience: '',
                educationLevel: '',
                preferredMajor: '',
            });

        } catch (err) {
            console.error(err);
            setError("Phân tích JD thất bại. Vui lòng kiểm tra lại kết nối hoặc API key và thử lại.");
            setShowAnalysis(false); // Hide analysis panel on error
        } finally {
            setIsLoading(false);
        }
    };

    const navigateToStep = (step: number) => {
        setCurrentStep(step);
    };

    const getMergedJd = () => {
        if (!standardizedJd) return null;

        const mergedJd = JSON.parse(JSON.stringify(standardizedJd)); // Deep copy
        if (!supplementaryJd) return mergedJd;

        const hasValue = (val: any) => val !== null && val !== undefined && String(val).trim() !== '';

        // Overwrite or add values from supplementary form
        if (hasValue(supplementaryJd.salary)) mergedJd.salary = supplementaryJd.salary;
        if (hasValue(supplementaryJd.experience)) mergedJd.experience = supplementaryJd.experience;
        if (hasValue(supplementaryJd.educationLevel)) mergedJd.educationLevel = supplementaryJd.educationLevel;
        if (hasValue(supplementaryJd.preferredMajor)) mergedJd.preferredMajor = supplementaryJd.preferredMajor;

        const mergeList = (original: string[], additional: string) => {
            const originalSet = new Set(original?.map(s => s.trim().toLowerCase()) || []);
            const additionalItems = additional.split('\n').map(s => s.trim()).filter(Boolean);
            additionalItems.forEach(item => {
                if (!originalSet.has(item.toLowerCase())) {
                    original.push(item);
                }
            });
            return original;
        };

        if (hasValue(supplementaryJd.skills)) {
            mergedJd.skills = mergeList([...(standardizedJd.skills || [])], supplementaryJd.skills);
        }
        if (hasValue(supplementaryJd.benefits)) {
            mergedJd.benefits = mergeList([...(standardizedJd.benefits || [])], supplementaryJd.benefits);
        }

        return mergedJd;
    };

    const handleSaveChanges = () => {
        const updatedJd = getMergedJd();
        if (updatedJd) {
            setStandardizedJd(updatedJd);
            setToast({ message: 'JD đã được cập nhật thành công!', type: 'success' });
        }
    };

    const handleSupplementaryJdChange = (field: string, value: string) => {
        setSupplementaryJd((prev: any) => ({...prev, [field]: value}));
    };

    const getMissingFields = (jd: any): string[] => {
        if (!jd) return [];
        const missing: string[] = [];
        if (!jd.salary?.trim()) missing.push('Mức lương');
        if (!jd.benefits || jd.benefits.length === 0) missing.push('Phúc lợi & Quyền lợi');
        if (!jd.skills || jd.skills.length === 0) missing.push('Kỹ năng cần có');
        if (!jd.experience?.trim()) missing.push('Kinh nghiệm tối thiểu');
        if (!jd.educationLevel?.trim()) missing.push('Trình độ học vấn');
        return missing;
    };

    const handleExport = (exportFn: () => void) => {
        const finalJd = getMergedJd();
        if (!finalJd) return;

        const missing = getMissingFields(finalJd);
        if (missing.length > 0) {
            if (!window.confirm(`JD có thể còn thiếu các thông tin sau:\n- ${missing.join('\n- ')}\n\nBạn vẫn muốn tiếp tục xuất file?`)) {
                return;
            }
        }
        exportFn();
    };

    const exportPdf = () => {
        const finalJd = getMergedJd();
        if (!finalJd || typeof jspdf === 'undefined') return;

        const { jsPDF } = jspdf;
        const doc = new jsPDF();

        doc.setFont('Roboto', 'normal');

        let y = 20;
        const pageMargin = 10;
        const contentWidth = doc.internal.pageSize.getWidth() - pageMargin * 2;

        const checkPageBreak = (neededHeight: number) => {
            if (y + neededHeight > doc.internal.pageSize.getHeight() - pageMargin) {
                doc.addPage();
                y = 20;
                return true;
            }
            return false;
        };

        doc.setFontSize(18);
        doc.setFont('Roboto', 'bold');
        const titleText = doc.splitTextToSize(finalJd.jobTitle || 'Mô tả công việc', contentWidth);
        checkPageBreak(titleText.length * 8);
        doc.text(titleText, pageMargin, y);
        y += titleText.length * 8;

        doc.setFontSize(12);
        doc.setFont('Roboto', 'normal');

        const addTextLine = (text: string) => {
            const splitText = doc.splitTextToSize(text, contentWidth);
            const neededHeight = splitText.length * 7;
            checkPageBreak(neededHeight);
            doc.text(splitText, pageMargin, y);
            y += neededHeight;
        };

        if(finalJd.company) addTextLine(`Công ty: ${finalJd.company}`);
        if(finalJd.salary) addTextLine(`Mức lương: ${finalJd.salary}`);
        y += 5;

        const addSection = (title: string, items: (string | null | undefined)[]) => {
            const filteredItems = items.filter(Boolean) as string[];
            if (filteredItems.length === 0) return;

            checkPageBreak(12);
            doc.setFontSize(14);
            doc.setFont('Roboto', 'bold');
            doc.text(title, pageMargin, y);
            y += 8;

            doc.setFontSize(12);
            doc.setFont('Roboto', 'normal');

            filteredItems.forEach(item => {
                const itemText = doc.splitTextToSize(`- ${item}`, contentWidth - 5);
                const neededHeight = itemText.length * 6;
                if (checkPageBreak(neededHeight)) {
                    doc.setFontSize(14);
                    doc.setFont('Roboto', 'bold');
                    doc.text(title, pageMargin, y);
                    y += 8;
                    doc.setFontSize(12);
                    doc.setFont('Roboto', 'normal');
                }
                doc.text(itemText, pageMargin + 5, y);
                y += neededHeight;
            });
            y += 5;
        };

        const allRequirements = [
            ...(finalJd.jobRequirements || []),
            finalJd.experience ? `Kinh nghiệm: ${finalJd.experience}` : null,
            finalJd.educationLevel ? `Học vấn: ${finalJd.educationLevel}` : null,
            finalJd.preferredMajor ? `Chuyên ngành: ${finalJd.preferredMajor}` : null,
        ];

        addSection("Mô tả công việc", finalJd.jobDescription || []);
        addSection("Yêu cầu công việc", allRequirements);
        addSection("Kỹ năng", finalJd.skills || []);
        addSection("Quyền lợi", finalJd.benefits || []);

        doc.save(`${(finalJd.jobTitle || 'mo_ta_cong_viec').replace(/\s/g, '_')}.pdf`);
    };

    const exportDocx = () => {
        const finalJd = getMergedJd();
        if (!finalJd || typeof docx === 'undefined') return;

        const { Document, Packer, Paragraph, TextRun, HeadingLevel } = docx;

        const children = [];
        children.push(new Paragraph({ text: finalJd.jobTitle || 'Mô tả công việc', heading: HeadingLevel.TITLE }));
        children.push(new Paragraph(""));

        const addTextLine = (label: string, value: string | undefined) => {
             if (value) {
                children.push(new Paragraph({ children: [new TextRun({ text: `${label}: `, bold: true }), new TextRun(value)] }));
             }
        }
        addTextLine('Công ty', finalJd.company);
        addTextLine('Mức lương', finalJd.salary);
        children.push(new Paragraph(""));

        const createSection = (title: string, items: string[] | undefined) => {
             if (!items || items.length === 0) return [];
             const sectionChildren = [new Paragraph({ heading: HeadingLevel.HEADING_2, text: title })];
             items.forEach(item => {
                sectionChildren.push(new Paragraph({ text: item, bullet: { level: 0 }}));
             });
             sectionChildren.push(new Paragraph("")); // spacing
             return sectionChildren;
        };

        children.push(...createSection("Mô tả công việc", finalJd.jobDescription));
        children.push(...createSection("Yêu cầu công việc", finalJd.jobRequirements));
        children.push(...createSection("Kỹ năng", finalJd.skills));
        children.push(...createSection("Quyền lợi", finalJd.benefits));

        const doc = new Document({ sections: [{ children }] });

        Packer.toBlob(doc).then((blob: Blob) => {
            saveAs(blob, `${(finalJd.jobTitle || 'mo_ta_cong_viec').replace(/\s/g, '_')}.docx`);
        });
    };

    const FileStatusIcon = ({ status, message }: { status: FileStatus; message?: string }) => {
        if (status === 'processing') return <div className="chj-spinner" style={{width: '16px', height: '16px', borderTopColor: 'var(--chj-primary-color)'}}></div>;
        if (status === 'success') return <span className="chj-status success">✓</span>;
        if (status === 'error') return <span className="chj-status error" title={message}>✗</span>;
        return null;
    };

    const MissingFieldsChecklist = () => {
        const mergedJd = getMergedJd();
        if (!mergedJd) return null;

        const fields = [
            { key: 'salary', label: 'Mức lương', present: !!mergedJd.salary?.trim() },
            { key: 'benefits', label: 'Phúc lợi & Quyền lợi', present: mergedJd.benefits?.length > 0 },
            { key: 'skills', label: 'Kỹ năng cần có', present: mergedJd.skills?.length > 0 },
            { key: 'experience', label: 'Kinh nghiệm tối thiểu', present: !!mergedJd.experience?.trim() },
            { key: 'educationLevel', label: 'Trình độ học vấn', present: !!mergedJd.educationLevel?.trim() },
        ];

        const allPresent = fields.every(f => f.present);

        return (
            <div className={`chj-analysis-card ${allPresent ? 'success' : 'warning'}`}>
                <h4>{allPresent ? '✅ Mục còn thiếu trong JD: Đã đủ' : '✗ Mục còn thiếu trong JD'}</h4>
                <ul className="chj-checklist">
                    {fields.map(field => (
                        <li key={field.key} className={field.present ? 'present' : 'missing'}>
                            <span className="chj-check-icon">{field.present ? '✓' : '✗'}</span> {field.label}
                        </li>
                    ))}
                </ul>
            </div>
        )
    }

    const PlatformStandardizer = () => {
        const mergedJd = getMergedJd();

        const platformConfigs: any = {
            topcv: {
                name: 'TopCV',
                required: ['jobTitle', 'company', 'salary', 'experience', 'jobDescription', 'jobRequirements', 'benefits'],
                requiredLabels: {
                    jobTitle: 'Tiêu đề công việc',
                    company: 'Tên công ty',
                    salary: 'Mức lương',
                    experience: 'Kinh nghiệm',
                    jobDescription: 'Mô tả công việc',
                    jobRequirements: 'Yêu cầu công việc',
                    benefits: 'Quyền lợi',
                },
                generatePreview: (jd: any) => {
                    return `TIÊU ĐỀ CÔNG VIỆC\n${jd.jobTitle || '[Chưa có]'}\n\n` +
                           `MÔ TẢ CÔNG VIỆC\n${(jd.jobDescription || []).map((i:string) => `- ${i}`).join('\n') || '[Chưa có]'}\n\n` +
                           `YÊU CẦU ỨNG VIÊN\n${(jd.jobRequirements || []).map((i:string) => `- ${i}`).join('\n') || '[Chưa có]'}\n` +
                           `- Kinh nghiệm: ${jd.experience || '[Chưa có]'}\n` +
                           `- Bằng cấp: ${jd.educationLevel || '[Chưa có]'}\n\n` +
                           `QUYỀN LỢI ĐƯỢC HƯỞNG\n${(jd.benefits || []).map((i:string) => `- ${i}`).join('\n') || '[Chưa có]'}\n\n` +
                           `MỨC LƯƠNG: ${jd.salary || '[Chưa có]'}`;
                },
            },
            linkedin: {
                name: 'LinkedIn',
                required: ['jobTitle', 'company', 'jobDescription', 'jobRequirements'],
                requiredLabels: {
                    jobTitle: 'Job Title',
                    company: 'Company',
                    jobDescription: 'About/Responsibilities',
                    jobRequirements: 'Qualifications',
                },
                generatePreview: (jd: any) => {
                    return `About the job\n${(jd.jobDescription || []).slice(0, 2).join(' ')}\n\n` +
                           `Responsibilities\n${(jd.jobDescription || []).map((i:string) => `• ${i}`).join('\n') || '[Not specified]'}\n\n` +
                           `Qualifications\n${(jd.jobRequirements || []).map((i:string) => `• ${i}`).join('\n') || '[Not specified]'}\n` +
                           `• Experience: ${jd.experience || '[Not specified]'}\n` +
                           `• Skills: ${(jd.skills || []).join(', ')}\n\n` +
                           `Benefits\n${(jd.benefits || []).map((i:string) => `• ${i}`).join('\n') || '[Not specified]'}`;
                },
            },
            generic_vn: {
                name: 'Generic VN (VietnamWorks, etc.)',
                required: ['jobTitle', 'salary', 'jobDescription', 'jobRequirements', 'benefits', 'skills'],
                 requiredLabels: {
                    jobTitle: 'Vị trí',
                    salary: 'Mức lương',
                    jobDescription: 'Mô tả công việc',
                    jobRequirements: 'Yêu cầu công việc',
                    benefits: 'Phúc lợi',
                    skills: 'Tags kỹ năng',
                },
                generatePreview: (jd: any) => {
                    return `VỊ TRÍ: ${jd.jobTitle || '[Chưa có]'}\n` +
                           `LƯƠNG: ${jd.salary || '[Chưa có]'}\n` +
                           `KINH NGHIỆM: ${jd.experience || '[Chưa có]'}\n` +
                           `ĐỊA ĐIỂM: [Vui lòng thêm địa điểm]\n\n` +
                           `----- MÔ TẢ CÔNG VIỆC -----\n${(jd.jobDescription || []).map((i:string) => `- ${i}`).join('\n') || '[Chưa có]'}\n\n` +
                           `----- YÊU CẦU -----\n${(jd.jobRequirements || []).map((i:string) => `- ${i}`).join('\n') || '[Chưa có]'}\n\n` +
                           `----- QUYỀN LỢI -----\n${(jd.benefits || []).map((i:string) => `- ${i}`).join('\n') || '[Chưa có]'}\n\n` +
                           `TAGS: ${(jd.skills || []).join(', ')}`;
                },
            },
            facebook: {
                name: 'Facebook/Group',
                required: ['jobTitle', 'salary', 'jobDescription', 'jobRequirements'],
                 requiredLabels: {
                    jobTitle: 'Vị trí',
                    salary: 'Lương',
                    jobDescription: 'Đầu việc chính',
                    jobRequirements: 'Yêu cầu',
                },
                generatePreview: (jd: any) => {
                    return `TUYỂN DỤNG: ${jd.jobTitle || '[Tên vị trí]'}\n\n` +
                           `Lương: ${jd.salary || '[Thoả thuận]'}\n` +
                           `Địa điểm: [Thêm địa điểm]\n\n` +
                           `MÔ TẢ:\n${(jd.jobDescription || []).slice(0, 5).map((i:string) => `- ${i}`).join('\n')}\n\n` +
                           `YÊU CẦU:\n${(jd.jobRequirements || []).slice(0, 5).map((i:string) => `- ${i}`).join('\n')}\n\n` +
                           `QUYỀN LỢI:\n${(jd.benefits || []).slice(0, 3).map((i:string) => `- ${i}`).join('\n')}\n\n` +
                           `Gửi CV về: [Thêm email/cách ứng tuyển]\n` +
                           `#tuyendung #${(jd.jobTitle || '').replace(/\s/g, '')} #vieclam`;
                },
            },
        };

        if (!mergedJd) return null;

        const currentPlatform = platformConfigs[selectedPlatform];

        const checkFieldPresence = (jd: any, field: string) => {
            const value = jd[field];
            if (Array.isArray(value)) return value.length > 0;
            return !!String(value || '').trim();
        };

        const missingFields = currentPlatform.required.filter((field: string) => !checkFieldPresence(mergedJd, field));

        const handleCopy = () => {
             if (missingFields.length > 0) {
                if (!window.confirm(`JD còn thiếu thông tin cho nền tảng này. Bạn vẫn muốn sao chép?`)) return;
            }
            const textToCopy = currentPlatform.generatePreview(mergedJd);
            navigator.clipboard.writeText(textToCopy)
                .then(() => setToast({ message: 'Đã sao chép vào clipboard!', type: 'success' }))
                .catch(() => setToast({ message: 'Sao chép thất bại!', type: 'error' }));
        };

        const handlePlatformExport = (type: 'pdf' | 'docx') => {
             if (missingFields.length > 0) {
                if (!window.confirm(`JD còn thiếu thông tin cho nền tảng này. Bạn vẫn muốn xuất file?`)) return;
            }
            const content = currentPlatform.generatePreview(mergedJd);
            const title = mergedJd.jobTitle || 'JD';

            if (type === 'pdf' && typeof jspdf !== 'undefined') {
                const { jsPDF } = jspdf;
                const doc = new jsPDF();
                doc.setFont('Roboto', 'normal');
                const splitText = doc.splitTextToSize(content, 180);
                doc.text(splitText, 15, 20);
                doc.save(`${title}_${selectedPlatform}.pdf`);
            } else if (type === 'docx' && typeof docx !== 'undefined') {
                const { Document, Packer, Paragraph } = docx;
                const paragraphs = content.split('\n').map((p: string) => new Paragraph(p));
                const doc = new Document({ sections: [{ children: paragraphs }] });
                Packer.toBlob(doc).then((blob: Blob) => {
                    saveAs(blob, `${title}_${selectedPlatform}.docx`);
                });
            }
        }


        return (
            <div className="chj-card chj-platform-standardizer-card">
                 <h2>Chuẩn hoá theo nền tảng</h2>
                 <div className="chj-platform-standardizer-content">
                    <div className="chj-platform-controls">
                        <div className="chj-form-group">
                            <label htmlFor="platform-select">Chọn nền tảng</label>
                            <select id="platform-select" value={selectedPlatform} onChange={e => setSelectedPlatform(e.target.value)}>
                                {Object.keys(platformConfigs).map(key => (
                                    <option key={key} value={key}>{platformConfigs[key].name}</option>
                                ))}
                            </select>
                        </div>
                        <div className={`chj-analysis-card ${missingFields.length === 0 ? 'success' : 'warning'}`}>
                             <h4>{missingFields.length === 0 ? '✅ Đã đủ thông tin' : '✗ Còn thiếu thông tin'}</h4>
                             <ul className="chj-checklist">
                                {currentPlatform.required.map((field: string) => (
                                    <li key={field} className={checkFieldPresence(mergedJd, field) ? 'present' : 'missing'}>
                                         <span className="chj-check-icon">{checkFieldPresence(mergedJd, field) ? '✓' : '✗'}</span> {currentPlatform.requiredLabels[field]}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <div className="chj-platform-preview-container">
                        <label>Bản xem trước</label>
                        <pre className="chj-platform-preview">
                            {currentPlatform.generatePreview(mergedJd)}
                        </pre>
                        <div className="chj-platform-actions">
                            <button className="chj-btn" onClick={handleCopy}>Sao chép</button>
                            <button className="chj-btn chj-btn-secondary" onClick={() => handlePlatformExport('pdf')}>Xuất PDF</button>
                            <button className="chj-btn chj-btn-secondary" onClick={() => handlePlatformExport('docx')}>Xuất DOCX</button>
                        </div>
                    </div>
                 </div>
            </div>
        );
    };

    // Show loading if scripts are not loaded yet
    if (!scriptsLoaded) {
        return (
            <div className="chuan-hoa-jd-container">
                <div className="chj-main-content" style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <div className="chj-placeholder">
                        <div className="chj-spinner" style={{ width: '40px', height: '40px' }}></div>
                        <p style={{ marginTop: '1rem' }}>Đang tải công cụ...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="chuan-hoa-jd-container">
            {toast && <div className={`chj-toast ${toast.type} show`}>{toast.message}</div>}

            {currentStep === 1 && (
                <div className="chj-main-content" id="step1">
                    <div className="chj-panel">
                        <div className="chj-card chj-input-card">
                            <h2>Step 1: Nhập & Phân tích JD</h2>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={(e) => handleFiles(e.target.files!)}
                                style={{ display: 'none' }}
                                multiple
                                accept=".pdf,.docx,.png,.jpg,.jpeg"
                            />
                            <div
                                className={`chj-dropzone ${isDragging ? 'dragging' : ''}`}
                                onClick={() => fileInputRef.current?.click()}
                                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); }}
                                onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); }}
                                onDrop={handleDrop}
                            >
                                <p>Kéo thả hoặc chọn file JD (PDF, DOCX, PNG, JPG) để đọc.</p>
                            </div>
                            <div className="chj-textarea-container">
                                <textarea
                                    value={rawJd}
                                    onChange={(e) => setRawJd(e.target.value)}
                                    placeholder="Dán JD thô hoặc tải file lên..."
                                    aria-label="Nhập mô tả công việc"
                                />
                            </div>
                            <div className="chj-checkbox-container">
                                <input
                                    type="checkbox"
                                    id="append-content"
                                    checked={appendContent}
                                    onChange={(e) => setAppendContent(e.target.checked)}
                                />
                                <label htmlFor="append-content">Gộp nội dung nhiều file</label>
                            </div>
                            {files.length > 0 && (
                                <div className="chj-file-list">
                                    {files.map((file, index) => (
                                        <div key={index} className="chj-file-item">
                                            <div className="chj-file-info">
                                                <span className="chj-file-name">{file.name}</span>
                                                {file.message && <span className="chj-file-message">{file.message}</span>}
                                            </div>
                                            <div className="chj-status"><FileStatusIcon status={file.status} message={file.message} /></div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <button className="chj-btn" onClick={handleStandardize} disabled={isLoading || isProcessingFiles || !rawJd.trim()}>
                                {isLoading ? <div className="chj-spinner"></div> : isProcessingFiles ? 'Đang xử lý file...' : "Chuẩn hoá & Hiển thị"}
                            </button>
                            {error && <p style={{ color: 'var(--chj-error-color)', marginTop: '1rem' }}>{error}</p>}
                        </div>
                    </div>
                    {showAnalysis && (
                        <div className="chj-panel">
                             <div className="chj-card" style={{flexGrow: 1}}>
                                <h2>Kết quả Phân tích</h2>
                                {isLoading && !standardizedJd && (
                                    <div className="chj-placeholder">
                                        <div className="chj-spinner" style={{borderColor: 'rgba(0,0,0,0.1)', borderTopColor: 'var(--chj-primary-color)'}}></div>
                                        <p>Gemini đang phân tích JD của bạn...</p>
                                    </div>
                                )}
                                {standardizedJd && (
                                    <>
                                        <div className="chj-output-container">
                                            <h3>{standardizedJd.jobTitle || "Chưa có vị trí công việc"}</h3>
                                            {standardizedJd.company && <p><strong>Công ty:</strong> {standardizedJd.company}</p>}
                                            {standardizedJd.salary && <p><strong>Mức lương:</strong> {standardizedJd.salary}</p>}

                                            {standardizedJd.jobDescription?.length > 0 && <>
                                                <h3>Mô tả công việc</h3>
                                                <ul>{standardizedJd.jobDescription.map((item: string, i: number) => <li key={`desc-${i}`}>{item}</li>)}</ul>
                                            </>}

                                            {standardizedJd.jobRequirements?.length > 0 && <>
                                                <h3>Yêu cầu công việc</h3>
                                                <ul>
                                                        {standardizedJd.jobRequirements.map((item: string, i: number) => <li key={`req-${i}`}>{item}</li>)}
                                                </ul>
                                            </>}
                                            {(standardizedJd.experience || standardizedJd.educationLevel || standardizedJd.preferredMajor) &&
                                                <ul>
                                                    {standardizedJd.experience && <li><strong>Kinh nghiệm:</strong> {standardizedJd.experience}</li>}
                                                    {standardizedJd.educationLevel && <li><strong>Học vấn:</strong> {standardizedJd.educationLevel}</li>}
                                                    {standardizedJd.preferredMajor && <li><strong>Chuyên ngành:</strong> {standardizedJd.preferredMajor}</li>}
                                                </ul>
                                            }

                                            {standardizedJd.skills?.length > 0 && <>
                                                <h3>Kỹ năng</h3>
                                                <ul>{standardizedJd.skills.map((item: string, i: number) => <li key={`skill-${i}`}>{item}</li>)}</ul>
                                            </>}

                                            {standardizedJd.benefits?.length > 0 && <>
                                                <h3>Quyền lợi</h3>
                                                <ul>{standardizedJd.benefits.map((item: string, i: number) => <li key={`ben-${i}`}>{item}</li>)}</ul>
                                            </>}
                                        </div>
                                        <button className="chj-btn" onClick={() => navigateToStep(2)} style={{marginTop: 'auto'}}>
                                            Bổ sung JD →
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {currentStep === 2 && standardizedJd && supplementaryJd && (
                 <div className="chj-main-content" id="step2">
                    <div className="chj-panel" style={{flex: '1 1 100%', maxWidth: '1200px', margin: '0 auto', width: '100%'}}>
                        <div className="chj-card" style={{flexGrow: 1}}>
                            <h2>Step 2: Bổ sung & Chỉnh sửa</h2>
                            <div className="chj-edit-jd-card">
                                <h4>{standardizedJd.jobTitle} <span style={{fontWeight: 'normal', color: 'var(--chj-text-color)'}}>- {standardizedJd.company}</span></h4>

                                <MissingFieldsChecklist />

                                <div className="chj-edit-form">
                                    <div className="chj-form-section">
                                        <h5>Mức lương & Phúc lợi</h5>
                                        <div className="chj-form-group">
                                            <label htmlFor="salary">Mức lương</label>
                                            <input id="salary" type="text" value={supplementaryJd.salary || ''} onChange={(e) => handleSupplementaryJdChange('salary', e.target.value)} placeholder={standardizedJd.salary || 'Điền mức lương mong muốn'}/>
                                        </div>
                                        <div className="chj-form-group">
                                            <label htmlFor="benefits">Phúc lợi (Mỗi mục một dòng)</label>
                                            <textarea id="benefits" value={supplementaryJd.benefits || ''} onChange={(e) => handleSupplementaryJdChange('benefits', e.target.value)} rows={4} placeholder="Thêm các phúc lợi còn thiếu..."></textarea>
                                        </div>
                                    </div>
                                    <div className="chj-form-section">
                                        <h5>Kỹ năng & Kinh nghiệm</h5>
                                            <div className="chj-form-group">
                                            <label htmlFor="skills">Kỹ năng cần có (Mỗi mục một dòng)</label>
                                            <textarea id="skills" value={supplementaryJd.skills || ''} onChange={(e) => handleSupplementaryJdChange('skills', e.target.value)} rows={4} placeholder="Thêm các kỹ năng còn thiếu..."></textarea>
                                        </div>
                                        <div className="chj-form-group">
                                            <label htmlFor="experience">Kinh nghiệm tối thiểu</label>
                                            <input id="experience" type="text" value={supplementaryJd.experience || ''} onChange={(e) => handleSupplementaryJdChange('experience', e.target.value)} placeholder={standardizedJd.experience || 'Bổ sung số năm kinh nghiệm cụ thể'}/>
                                        </div>
                                    </div>
                                    <div className="chj-form-section">
                                        <h5>Học vấn</h5>
                                        <div className="chj-form-group">
                                            <label htmlFor="educationLevel">Trình độ học vấn</label>
                                            <input id="educationLevel" type="text" value={supplementaryJd.educationLevel || ''} onChange={(e) => handleSupplementaryJdChange('educationLevel', e.target.value)} placeholder={standardizedJd.educationLevel || 'Điền trình độ học vấn yêu cầu'}/>
                                        </div>
                                            <div className="chj-form-group">
                                            <label htmlFor="preferredMajor">Chuyên ngành ưu tiên</label>
                                            <input id="preferredMajor" type="text" value={supplementaryJd.preferredMajor || ''} onChange={(e) => handleSupplementaryJdChange('preferredMajor', e.target.value)} placeholder={standardizedJd.preferredMajor || 'Điền chuyên ngành ưu tiên'}/>
                                        </div>
                                    </div>
                                    <button className="chj-btn" onClick={handleSaveChanges}>Cập nhật JD</button>
                                </div>
                            </div>

                            <div className="chj-step-navigation">
                                <button className="chj-btn chj-btn-secondary" onClick={() => navigateToStep(1)}>← Quay lại Step 1</button>
                                <div className="chj-export-buttons">
                                    <button className="chj-btn" onClick={() => handleExport(exportPdf)}>Xuất PDF (Chung)</button>
                                    <button className="chj-btn chj-btn-secondary" onClick={() => handleExport(exportDocx)}>Xuất DOCX (Chung)</button>
                                </div>
                                <button
                                    className="chj-btn"
                                    onClick={() => navigateToStep(3)}
                                    disabled={getMissingFields(getMergedJd()).length > 0}
                                    title={getMissingFields(getMergedJd()).length > 0 ? `Vui lòng điền đủ các mục còn thiếu: ${getMissingFields(getMergedJd()).join(', ')}` : 'Chuyển đến bước định dạng'}
                                >
                                    Định dạng nền tảng JD →
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {currentStep === 3 && standardizedJd && supplementaryJd && (
                 <div className="chj-main-content" id="step3" style={{flexDirection: 'column'}}>
                    <div className="chj-panel" style={{flex: '1 1 100%', maxWidth: '1200px', margin: '0 auto', width: '100%'}}>
                        <div className="chj-card" style={{flexGrow: 1}}>
                            <h2>Step 3: Chuẩn hoá theo nền tảng</h2>
                            <PlatformStandardizer />
                            <div className="chj-step-navigation">
                                <button className="chj-btn chj-btn-secondary" onClick={() => navigateToStep(2)}>← Quay lại Step 2</button>
                            </div>
                        </div>
                     </div>
                </div>
            )}
        </div>
    );
};

export default ChuanHoaJD;
