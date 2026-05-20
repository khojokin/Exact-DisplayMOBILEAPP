import React, { createContext, useContext, useState } from "react";

interface AIContextValue {
  aiEnabled: boolean;
  setAiEnabled: (v: boolean) => void;
}

const AIContext = createContext<AIContextValue>({
  aiEnabled: true,
  setAiEnabled: () => {},
});

export function AIProvider({ children }: { children: React.ReactNode }) {
  const [aiEnabled, setAiEnabled] = useState(true);
  return (
    <AIContext.Provider value={{ aiEnabled, setAiEnabled }}>
      {children}
    </AIContext.Provider>
  );
}

export function useAI() {
  return useContext(AIContext);
}
