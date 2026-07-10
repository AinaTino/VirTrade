import { createContext, useContext, useState } from 'react';

const TradingContext = createContext(null);

export function TradingProvider({ children }) {
  const [draft, setDraft] = useState({
    symbole: 'AAPL',
    sens: 'Buy',
    type: 'Market',
    quantite: 1,
    prix: null,
    stopPrix: null,
    expiresAt: null
  });

  const updateDraft = (patch) => setDraft((d) => ({ ...d, ...patch }));

  return (
    <TradingContext.Provider value={{ draft, updateDraft }}>
      {children}
    </TradingContext.Provider>
  );
}

export function useTrading() {
  return useContext(TradingContext);
}
