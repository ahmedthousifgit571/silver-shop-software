'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import AppSidebar from './AppSidebar';
import AppHeader from './AppHeader';
import GlobalSearchModal from './GlobalSearchModal';
import RateTickerModal from './RateTickerModal';
import BarcodeScannerModal from './BarcodeScannerModal';
import ProductModal from './ProductModal';
import { SilverRates, Product } from '@/lib/types';
import { initialRates } from '@/lib/storage';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [rates, setRates] = useState<SilverRates>(initialRates);

  // Global Modals state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isRatesOpen, setIsRatesOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);

  useEffect(() => {
    fetch('/api/rates')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.fineRate999) setRates(data);
      })
      .catch(() => {});
  }, []);

  // Keyboard shortcut Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleUpdateRates = async (newRates: SilverRates) => {
    setRates(newRates);
    try {
      await fetch('/api/rates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRates),
      });
    } catch (e) {}
  };

  const handleSaveProduct = async (productData: Partial<Product>) => {
    try {
      await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });
      setIsAddProductOpen(false);
      window.location.reload();
    } catch (e) {}
  };

  // If on login or public verification page, do not render sidebar or header
  const isBarePage = pathname === '/login' || pathname.startsWith('/p/');

  if (isBarePage) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-[#F8F9FA] text-slate-900 overflow-hidden font-sans">
      {/* Collapsible Left Sidebar */}
      <AppSidebar
        onOpenScanner={() => setIsScannerOpen(true)}
        onOpenRates={() => setIsRatesOpen(true)}
        onOpenAddProduct={() => setIsAddProductOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <AppHeader
          rates={rates}
          onOpenRates={() => setIsRatesOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenAddProduct={() => setIsAddProductOpen(true)}
        />

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto bg-[#F8F9FA] focus:outline-none">
          {children}
        </main>
      </div>

      {/* Global Modals */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      <RateTickerModal
        isOpen={isRatesOpen}
        onClose={() => setIsRatesOpen(false)}
        rates={rates}
        onSaveRates={handleUpdateRates}
      />

      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={(sku) => {
          setIsScannerOpen(false);
          window.location.href = `/pos?sku=${encodeURIComponent(sku)}`;
        }}
      />

      <ProductModal
        isOpen={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
        onSaveProduct={handleSaveProduct}
      />
    </div>
  );
}
