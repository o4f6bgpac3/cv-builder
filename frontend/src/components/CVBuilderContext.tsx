import React, { createContext, useContext } from 'react';
import { useCVBuilder } from './CVBuilder.hook';
import { CVData } from './state';

interface CVBuilderContextType {
  addDuty: (index: number) => void;
  addField: (section: keyof CVData, isNestedArray?: boolean) => void;
  handleChange: (
    section: keyof CVData,
    index: number,
    field: string | null,
    value: string | string[]
  ) => void;
  removeField: (field: keyof CVData, index: number) => void;
  updateCvData: (newData: Partial<CVData>) => void;
}

const CVBuilderContext = createContext<CVBuilderContextType | undefined>(undefined);

export const CVBuilderProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const cvBuilderHook = useCVBuilder();

  return <CVBuilderContext.Provider value={cvBuilderHook}>{children}</CVBuilderContext.Provider>;
};

export const useCVBuilderContext = () => {
  const context = useContext(CVBuilderContext);
  if (context === undefined) {
    throw new Error('useCVBuilderContext must be used within a CVBuilderProvider');
  }
  return context;
};
