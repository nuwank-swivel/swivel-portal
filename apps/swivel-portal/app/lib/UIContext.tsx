import { createContext, useContext, useState, ReactNode } from 'react';

export interface User {
  azureAdId: string;
  name?: string;
  email: string;
  isAdmin?: boolean;
}

interface UIContextType {
  currentModule: string | null;
  setCurrentModule: (module: string | null) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: ReactNode }) {
  const [currentModule, setCurrentModule] = useState<string | null>(null);

  return (
    <UIContext.Provider value={{ currentModule, setCurrentModule }}>
      {children}
    </UIContext.Provider>
  );
}

export function useUIContext() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error('useUIContext must be used within a UIProvider');
  return ctx;
}
