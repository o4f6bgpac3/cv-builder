import { create } from 'zustand';

export type Experience = {
  title: string;
  company: string;
  period: string;
  duties: string[];
};

export type CVData = {
  name: string;
  address: string;
  phone1: string;
  phone2: string;
  email: string;
  statement: string;
  skills: string[];
  experience: Experience[];
  interests: string[];
};

export const DefaultCVData: CVData = {
  name: '',
  address: '',
  phone1: '',
  phone2: '',
  email: '',
  statement: '',
  skills: [],
  experience: [],
  interests: [],
};

type State = {
  cvData: CVData;
  isExportingJSON: boolean;
  isGeneratingPDF: boolean;
  isMobile: boolean;
  openPdfDialog: boolean;
  pdfBlob: string | null;
  setCvData: (data: Partial<CVData> | ((prev: CVData) => Partial<CVData>)) => void;
  setIsExportingJSON: (isExporting: boolean) => void;
  setIsGeneratingPDF: (isGenerating: boolean) => void;
  setIsMobile: (isMobile: boolean) => void;
  setOpenPdfDialog: (open: boolean) => void;
  setPdfBlob: (blob: string | null) => void;
};

export const useStore = create<State>((set) => ({
  cvData: DefaultCVData,
  isExportingJSON: false,
  isGeneratingPDF: false,
  isMobile: false,
  openPdfDialog: false,
  pdfBlob: null,
  setCvData: (data) =>
    set((state) => ({
      cvData:
        typeof data === 'function'
          ? { ...state.cvData, ...data(state.cvData) }
          : { ...state.cvData, ...data },
    })),
  setIsExportingJSON: (isExporting) => set({ isExportingJSON: isExporting }),
  setIsGeneratingPDF: (isGenerating) => set({ isGeneratingPDF: isGenerating }),
  setIsMobile: (isMobile) => set({ isMobile }),
  setOpenPdfDialog: (open) => set({ openPdfDialog: open }),
  setPdfBlob: (blob) => set({ pdfBlob: blob }),
}));
