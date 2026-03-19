import React, { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../../../src/firebase';


interface LoginPageProps {
  onLogin: (email: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [successStage, setSuccessStage] = useState<'idle' | 'celebrating' | 'transitioning'>('idle');
  const [error, setError] = useState('');

  const handleGoogleSignIn = async () => {
    setError('');
    const provider = new GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/drive.readonly');
    try {
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;
      const user = result.user;
      
      try { 
        localStorage.setItem('authEmail', user.email || ''); 
        if (token) {
          localStorage.setItem('googleDriveToken', token);
        }
      } catch {}
      setShowSuccess(true);
      setSuccessStage('celebrating');
      setTimeout(() => {
        setSuccessStage('transitioning');
        setTimeout(() => {
          onLogin(user.email || '');
        }, 800);
      }, 2000);
    } catch (err: any) {
      setError('Đăng nhập Google thất bại: ' + (err.message || 'Vui lòng thử lại'));
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center relative overflow-hidden transition-all duration-800 ${successStage === 'transitioning' ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`} style={{ backgroundColor: '#0B1220' }}>
      {/* AI Aurora Effect - matching main app */}
      <div className="ai-aurora"></div>
      
      {/* Grid Overlay - matching main app */}
      <div className="grid-overlay"></div>
      
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className={`absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-500/15 rounded-full blur-3xl transition-all duration-1000 ${successStage === 'celebrating' ? 'animate-pulse scale-110 bg-green-500/20' : 'animate-pulse'}`}></div>
        <div className={`absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/12 rounded-full blur-3xl transition-all duration-1000 delay-1000 ${successStage === 'celebrating' ? 'animate-pulse scale-110 bg-emerald-500/20' : 'animate-pulse'}`}></div>
        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl transition-all duration-1000 delay-500 ${successStage === 'celebrating' ? 'animate-pulse scale-110 bg-teal-500/20' : 'animate-pulse'}`}></div>
        
        {/* Success confetti effect */}
        {successStage === 'celebrating' && (
          <>
            <div className="absolute top-10 left-10 w-4 h-4 bg-yellow-400 rounded-full animate-bounce delay-0 opacity-70"></div>
            <div className="absolute top-20 right-20 w-3 h-3 bg-pink-400 rounded-full animate-bounce delay-200 opacity-70"></div>
            <div className="absolute bottom-20 left-20 w-5 h-5 bg-blue-400 rounded-full animate-bounce delay-400 opacity-70"></div>
            <div className="absolute bottom-10 right-10 w-2 h-2 bg-green-400 rounded-full animate-bounce delay-600 opacity-70"></div>
            <div className="absolute top-1/3 left-1/3 w-3 h-3 bg-purple-400 rounded-full animate-bounce delay-300 opacity-70"></div>
            <div className="absolute bottom-1/3 right-1/3 w-4 h-4 bg-orange-400 rounded-full animate-bounce delay-500 opacity-70"></div>
          </>
        )}
      </div>

      <div className="relative z-10 w-full flex flex-col items-center justify-center px-4">
        {/* Success Notification */}
        {showSuccess && (
          <div className={`mb-6 p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/50 rounded-2xl backdrop-blur-sm shadow-lg transition-all duration-700 ease-out transform max-w-md w-full
            ${successStage === 'celebrating' ? 'scale-100 opacity-100 translate-y-0 animate-pulse' : 'scale-95 opacity-0 translate-y-4'}`}>
            <div className="flex items-center justify-center space-x-2">
              <i className={`fa-solid fa-check-circle text-green-400 text-xl transition-all duration-500 ${successStage === 'celebrating' ? 'animate-bounce scale-110' : ''}`}></i>
              <span className="text-green-200 font-medium animate-pulse">Đăng nhập thành công!</span>
            </div>
            {successStage === 'celebrating' && (
              <div className="mt-3 flex justify-center space-x-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce delay-0"></div>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce delay-200"></div>
              </div>
            )}
          </div>
        )}

        {/* Error Notification */}
        {error && (
          <div className="mb-6 p-4 bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-400/50 rounded-2xl backdrop-blur-sm shadow-lg transition-all duration-500 ease-in-out max-w-md w-full">
            <div className="flex items-center justify-center space-x-2">
              <i className="fa-solid fa-exclamation-triangle text-red-400 text-xl animate-bounce"></i>
              <span className="text-red-200 font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Main card with high-end glassmorphism */}
        <div className={`backdrop-blur-2xl bg-slate-900/40 border border-white/10 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-10 max-w-md w-full transform transition-all duration-700 hover:scale-[1.01] relative overflow-hidden ${successStage === 'celebrating' ? 'scale-105 shadow-emerald-500/20 border-emerald-400/30' : ''}`}>
          {/* Subtle inner glow */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          
          {/* Logo/Brand Section */}
          <div className="text-center mb-10 relative">
            <div className="inline-flex items-center justify-center w-28 h-28 rounded-3xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 backdrop-blur-md border border-white/10 shadow-2xl mb-6 transform hover:rotate-3 transition-transform duration-500 overflow-hidden p-3 group/logo">
              <div className="absolute inset-0 bg-gradient-to-tr from-cyan-400/10 to-transparent opacity-0 group-hover/logo:opacity-100 transition-opacity"></div>
              <img
                src="/images/logos/logo.jpg"
                alt="Support HR Logo"
                className="w-full h-full object-contain drop-shadow-2xl"
              />
            </div>
            <h1 className="text-4xl font-extrabold text-white mb-3 tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400">
              Support HR
            </h1>
            <p className="text-slate-400 text-lg font-light leading-relaxed">
              Giải pháp tuyển dụng <span className="text-cyan-400 font-medium">AI</span> tương lai
            </p>
          </div>

          {/* Social Proof / Trust Line */}
          <div className="flex items-center justify-center gap-4 mb-8 opacity-60">
            <div className="h-px w-8 bg-slate-700"></div>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-medium">Thành viên hệ sinh thái TechFuture</span>
            <div className="h-px w-8 bg-slate-700"></div>
          </div>

          {/* Google Sign In Button - Premium Style */}
          <div className="space-y-6">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full flex justify-center items-center py-4.5 px-6 rounded-2xl shadow-xl text-lg font-semibold text-white bg-gradient-to-r from-slate-800 to-slate-900 border border-white/10 hover:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-cyan-500/10 backdrop-blur-sm group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <svg className="w-6 h-6 mr-4 group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M5.26620003,9.76452941 C6.19878754,6.93863203 8.85444915,4.90909091 12,4.90909091 C13.6909091,4.90909091 15.2181818,5.50909091 16.4181818,6.49090909 L19.9090909,3 C17.7818182,1.14545455 15.0545455,0 12,0 C7.27006974,0 3.1977497,2.69829785 1.23999023,6.65002441 L5.26620003,9.76452941 Z"/>
                <path fill="#34A853" d="M16.0407269,18.0125889 C14.9509167,18.7163016 13.5660892,19.0909091 12,19.0909091 C8.86648613,19.0909091 6.21911939,17.076871 5.27698177,14.2678769 L1.23746264,17.3349879 C3.19279051,21.2936293 7.26500293,24 12,24 C14.9328362,24 17.7353462,22.9573905 19.834192,20.9995801 L16.0407269,18.0125889 Z"/>
                <path fill="#4A90E2" d="M19.834192,20.9995801 C22.0291676,18.9520994 23.4545455,15.903663 23.4545455,12 C23.4545455,11.2909091 23.3454545,10.5818182 23.1818182,9.90909091 L12,9.90909091 L12,14.4545455 L18.4363636,14.4545455 C18.1187732,16.013626 17.2662994,17.2212117 16.0407269,18.0125889 L19.834192,20.9995801 Z"/>
                <path fill="#FBBC05" d="M5.27698177,14.2678769 C5.03832634,13.556323 4.90909091,12.7937589 4.90909091,12 C4.90909091,11.2182781 5.03443647,10.4668121 5.26620003,9.76452941 L1.23999023,6.65002441 C0.43658717,8.26043162 0,10.0753848 0,12 C0,13.9195484 0.444780743,15.7301709 1.23746264,17.3349879 L5.27698177,14.2678769 Z"/>
              </svg>
              Đăng nhập với Google
            </button>
            
            <p className="text-center text-slate-500 text-xs mt-6 leading-relaxed">
              Bằng cách tiếp tục, bạn đồng ý với <a href="#" className="underline decoration-slate-600 hover:text-slate-300">Điều khoản dịch vụ</a> và <a href="#" className="underline decoration-slate-600 hover:text-slate-300">Chính sách bảo mật</a> của chúng tôi.
            </p>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-12 text-slate-600 text-[10px] uppercase tracking-widest font-medium">
          © 2025 SUPPORT HR • POWERED BY TECHFUTURE AI
        </div>
      </div>
    </div>
  );
};

export default LoginPage;