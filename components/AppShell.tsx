'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import AppSidebar from './AppSidebar';
import AppHeader from './AppHeader';
import GlobalSearchModal from './GlobalSearchModal';
import RateTickerModal from './RateTickerModal';
import BarcodeScannerModal from './BarcodeScannerModal';
import ProductModal from './ProductModal';
import CategoryManagementModal from './CategoryManagementModal';
import { SilverRates, Product } from '@/lib/types';
import { initialRates } from '@/lib/storage';
import { useRates } from '@/context/RatesContext';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { rates, isRateModalOpen, openRateModal, closeRateModal, updateRates } = useRates();

  // Global Modals state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

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
    await updateRates(newRates);
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
        onOpenRates={openRateModal}
        onOpenAddCategory={() => setIsCategoryModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <AppHeader
          rates={rates}
          onOpenRates={openRateModal}
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
        isOpen={isRateModalOpen}
        onClose={closeRateModal}
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

      <CategoryManagementModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
      />
    </div>
  );
}
