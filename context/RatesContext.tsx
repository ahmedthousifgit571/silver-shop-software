'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { SilverRates } from '@/lib/types';
import { initialRates } from '@/lib/storage';

interface RatesContextType {
  rates: SilverRates;
  isLoading: boolean;
  isRateModalOpen: boolean;
  openRateModal: () => void;
  closeRateModal: () => void;
  updateRates: (newRates: SilverRates) => Promise<boolean>;
  refreshRates: () => Promise<void>;
}

const RatesContext = createContext<RatesContextType>({
  rates: initialRates,
  isLoading: true,
  isRateModalOpen: false,
  openRateModal: () => {},
  closeRateModal: () => {},
  updateRates: async () => false,
  refreshRates: async () => {},
});

export function RatesProvider({ children }: { children: React.ReactNode }) {
  const [rates, setRates] = useState<SilverRates>(initialRates);
  const [isLoading, setIsLoading] = useState(true);
  const [isRateModalOpen, setIsRateModalOpen] = useState(false);

  const refreshRates = useCallback(async () => {
    try {
      const res = await fetch('/api/rates');
      if (res.ok) {
        const data = await res.json();
        if (data && (data.fineRate999 || data.sterlingRate925)) {
          setRates((prev) => ({
            ...prev,
            ...data,
            goldRate916: data.goldRate916 ?? 7150.0,
            displayShowcase: data.displayShowcase || '925',
          }));
        }
      }
    } catch (e) {
      console.error('Failed to fetch rates', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshRates();
  }, [refreshRates]);

  const updateRates = async (newRates: SilverRates): Promise<boolean> => {
    // Optimistic update
    const preparedRates: SilverRates = {
      ...newRates,
      goldRate916: newRates.goldRate916 ?? 7150.0,
      displayShowcase: newRates.displayShowcase || '925',
      lastUpdated: new Date().toISOString(),
    };
    setRates(preparedRates);

    try {
      const res = await fetch('/api/rates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preparedRates),
      });
      if (res.ok) {
        const data = await res.json();
        setRates((prev) => ({
          ...prev,
          ...data,
          goldRate916: data.goldRate916 ?? 7150.0,
          displayShowcase: data.displayShowcase || '925',
        }));
        return true;
      }
    } catch (e) {
      console.error('Failed to update rates', e);
    }
    return false;
  };

  const openRateModal = () => setIsRateModalOpen(true);
  const closeRateModal = () => setIsRateModalOpen(false);

  return (
    <RatesContext.Provider
      value={{
        rates,
        isLoading,
        isRateModalOpen,
        openRateModal,
        closeRateModal,
        updateRates,
        refreshRates,
      }}
    >
      {children}
    </RatesContext.Provider>
  );
}

export const useRates = () => useContext(RatesContext);
