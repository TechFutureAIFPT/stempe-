
import React, { Suspense, lazy } from 'react';
import type { AppStep, Candidate, HardFilters, WeightCriteria } from '../../../assets/types';
import JDInput from '../../chuc-nang/cau-hinh-tieu-chi/JDInput';

// Lazy load heavy components
const WeightsConfig = lazy(() => import('../../chuc-nang/cau-hinh-tieu-chi/WeightsConfig'));
const CVUpload = lazy(() => import('../../chuc-nang/quan-ly-cv/CVUpload'));
const AnalysisResults = lazy(() => import('../../chuc-nang/quan-ly-cv/AnalysisResults'));
import ScreenerHeader from '../../ui/ScreenerHeader';

// Loading component
const ModuleLoader = () => (
  <div className="flex justify-center items-center h-32">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
  </div>
);


interface ScreenerPageProps {
  jdText: string;
  setJdText: React.Dispatch<React.SetStateAction<string>>;
  jobPosition: string;
  setJobPosition: React.Dispatch<React.SetStateAction<string>>;
  weights: WeightCriteria;
  setWeights: React.Dispatch<React.SetStateAction<WeightCriteria>>;
  hardFilters: HardFilters;
  setHardFilters: React.Dispatch<React.SetStateAction<HardFilters>>;
  cvFiles: File[];
  setCvFiles: React.Dispatch<React.SetStateAction<File[]>>;
  analysisResults: Candidate[];
  setAnalysisResults: React.Dispatch<React.SetStateAction<Candidate[]>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  loadingMessage: string;
  setLoadingMessage: React.Dispatch<React.SetStateAction<string>>;
  activeStep: AppStep;
  setActiveStep: (step: AppStep) => void;
  completedSteps: AppStep[];
  markStepAsCompleted: (step: AppStep) => void;
}

const ScreenerPage: React.FC<ScreenerPageProps> = (props) => {
  const { activeStep } = props;

  const getHeaderInfo = () => {
    switch (activeStep) {
      case 'jd':
        return { subtitle: "JOB DESCRIPTION ANALYTICS", icon: "fa-wand-magic-sparkles" };
      case 'weights':
        return { subtitle: "BƯỚC 2: TRỌNG SỐ & BỘ LỌC", icon: "fa-sliders" };
      case 'upload':
        return { subtitle: "BƯỚC 3: DỮ LIỆU ĐẦU VÀO", icon: "fa-cloud-arrow-up" };
      case 'analysis':
        return { subtitle: "BƯỚC 4: KẾT QUẢ PHÂN TÍCH", icon: "fa-chart-line" };
      case 'chatbot':
        return { subtitle: "AI CHATBOT ADVISOR", icon: "fa-robot" };
      default:
        return { subtitle: "JOB DESCRIPTION ANALYTICS", icon: "fa-wand-magic-sparkles" };
    }
  };

  const headerInfo = getHeaderInfo();

  return (
    <div className="h-full flex flex-col flex-1 overflow-hidden">
      {/* Global Header Connected to Sidebar */}
      <ScreenerHeader 
        subtitle={headerInfo.subtitle} 
        icon={headerInfo.icon}
      >
        {/* Step-specific header actions will be handled by modules for now to avoid prop drilling complexity, 
            or we can move them here later if needed. For now, we focus on the "connected" visual. */}
      </ScreenerHeader>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className={activeStep === 'jd' ? 'block h-full' : 'hidden'}>
          <JDInput
            jdText={props.jdText}
            setJdText={props.setJdText}
            jobPosition={props.jobPosition}
            setJobPosition={props.setJobPosition}
            hardFilters={props.hardFilters}
            setHardFilters={props.setHardFilters}
            onComplete={() => {
              props.markStepAsCompleted('jd');
              props.setActiveStep('weights');
            }}
          />
        </div>
        <div className={activeStep === 'weights' ? 'block h-full' : 'hidden'}>
          <Suspense fallback={<ModuleLoader />}>
            <WeightsConfig
              weights={props.weights}
              setWeights={props.setWeights}
              hardFilters={props.hardFilters}
              setHardFilters={props.setHardFilters}
              onComplete={() => {
                props.markStepAsCompleted('weights');
                props.setActiveStep('upload');
              }}
            />
          </Suspense>
        </div>
        <div className={activeStep === 'upload' ? 'block h-full' : 'hidden'}>
          <Suspense fallback={<ModuleLoader />}>
            <CVUpload
              cvFiles={props.cvFiles}
              setCvFiles={props.setCvFiles}
              jdText={props.jdText}
              weights={props.weights}
              hardFilters={props.hardFilters}
              setAnalysisResults={props.setAnalysisResults}
              setIsLoading={props.setIsLoading}
              setLoadingMessage={props.setLoadingMessage}
              onAnalysisStart={() => {
                props.markStepAsCompleted('upload');
                props.setActiveStep('analysis');
              }}
              completedSteps={props.completedSteps}
            />
          </Suspense>
        </div>
        <div className={activeStep === 'analysis' ? 'block h-full' : 'hidden'}>
          <Suspense fallback={<ModuleLoader />}>
            <AnalysisResults
              isLoading={props.isLoading}
              loadingMessage={props.loadingMessage}
              results={props.analysisResults}
              jobPosition={props.jobPosition}
              locationRequirement={props.hardFilters.location}
              jdText={props.jdText}
              setActiveStep={props.setActiveStep}
              markStepAsCompleted={props.markStepAsCompleted}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default ScreenerPage;