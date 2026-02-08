'use client';

import { useState, useMemo, ReactNode } from 'react';
import { StoreContext, createStore, createInitialState, AppState } from '@/lib/store';

export default function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(createInitialState);

  const store = useMemo(() => createStore(state, setState), [state]);

  return (
    <StoreContext.Provider value={store}>
      {children}
    </StoreContext.Provider>
  );
}
