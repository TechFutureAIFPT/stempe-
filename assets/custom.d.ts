declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.svg';

interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY_1: string;
  readonly VITE_GEMINI_API_KEY_2: string;
  readonly VITE_GEMINI_API_KEY_3: string;
  readonly VITE_GEMINI_API_KEY_4: string;
  readonly VITE_OPENAI_API_KEY: string;
  readonly VITE_OPENAI_MODEL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

export {};