'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  Plus,
  Phone,
  Mail,
  MapPin,
  FileText,
  DollarSign,
  Printer,
  ChevronRight,
  Wallet,
  ArrowRight,
  Receipt,
  UserCheck,
  ArrowLeft,
} from 'lucide-react';
import CustomerModal from '@/components/CustomerModal';
import CustomerPaymentModal from '@/components/CustomerPaymentModal';
import { Customer, Invoice, KhataTransaction } from '@/lib/types';
import { initialCustomers, initialInvoices } from '@/lib/storage';

export default function CustomersCRMPage() {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(initialCustomers[0] || null);

  // Mobile View Switch: 'LIST' vs 'DETAIL'
  const [mobileCustomerView, setMobileCustomerView] = useState<'LIST' | 'DETAIL'>('LIST');

  // Modals
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [khataTransactions, setKhataTransactions] = useState<KhataTransaction[]>([]);

  useEffect(() => {
    fetch('/api/customers')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setCustomers(data);
          setSelectedCustomer(data[0]);
        }
      })
      .catch(() => {});

    fetch('/api/billing')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setInvoices(data);
      })
      .catch(() => {});
  }, []);

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery)
  );

  const handleSaveCustomer = async (custData: Partial<Customer>) => {
    const saved = {
      ...custData,
      id: custData.id || `cust-${Date.now()}`,
      totalSpend: custData.totalSpend || 0,
      totalBills: custData.totalBills || 0,
      advanceBalance: custData.advanceBalance || 0,
      outstandingBalance: custData.outstandingBalance || 0,
      createdAt: new Date().toISOString(),
    } as Customer;

    setCustomers((prev) => [saved, ...prev.filter((c) => c.id !== saved.id)]);
    setSelectedCustomer(saved);
    setMobileCustomerView('DETAIL');

    try {
      await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(custData),
      });
    } catch (e) {}
  };

  const handleRecordKhata = (tx: KhataTransaction) => {
    setKhataTransactions([tx, ...khataTransactions]);
    if (selectedCustomer) {
      const updatedCust = { ...selectedCustomer };
      if (tx.type === 'PAYMENT_CREDIT') {
        updatedCust.outstandingBalance = Math.max(0, updatedCust.outstandingBalance - tx.amount);
      } else if (tx.type === 'ADVANCE_DEPOSIT') {
        updatedCust.advanceBalance += tx.amount;
      }
      setSelectedCustomer(updatedCust);
      setCustomers((prev) => prev.map((c) => (c.id === updatedCust.id ? updatedCust : c)));
    }
  };

  const customerInvoices = selectedCustomer
    ? invoices.filter(
        (inv) =>
          inv.customerId === selectedCustomer.id ||
          inv.customerPhone === selectedCustomer.phone
      )
    : [];

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-8 py-5 sm:py-8 space-y-5 sm:space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <div className="p-1.5 bg-purple-50 text-purple-600 rounded-lg border border-purple-200/60 flex-shrink-0">
              <Users className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span>Customer CRM & Khata Ledger</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Customer directory, purchase history, advance balance, and credit dues.
          </p>
        </div>

        <button
          onClick={() => {
            setCustomerToEdit(null);
            setIsCustomerModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs shadow-blue-500/20 transition active:scale-98"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Customer</span>
        </button>
      </div>

      {/* 2-Column Split with Mobile View Switcher */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Customer Directory (Hidden on mobile when viewing detail) */}
        <div className={`lg:col-span-5 space-y-3 ${mobileCustomerView === 'DETAIL' ? 'hidden lg:block' : 'block'}`}>
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or mobile..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none shadow-xs font-medium"
            />
          </div>

          {/* Customer Cards List */}
          <div className="space-y-2 max-h-[calc(100vh-230px)] overflow-y-auto pr-1">
            {filteredCustomers.map((cust) => {
              const isSelected = selectedCustomer?.id === cust.id;
              const hasDue = (cust.outstandingBalance || 0) > 0;
              const hasAdvance = (cust.advanceBalance || 0) > 0;

              return (
                <div
                  key={cust.id}
                  onClick={() => {
                    setSelectedCustomer(cust);
                    setMobileCustomerView('DETAIL');
                  }}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/25'
                      : 'bg-white hover:bg-slate-50/80 border-slate-200/90 shadow-2xs'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`font-semibold text-xs truncate ${
                          isSelected ? 'text-white' : 'text-slate-900'
                        }`}
                      >
                        {cust.name}
                      </span>
                      {hasDue && (
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                            isSelected
                              ? 'bg-rose-500 text-white border-rose-400'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          Due: ₹{cust.outstandingBalance}
                        </span>
                      )}
                      {hasAdvance && (
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                            isSelected
                              ? 'bg-emerald-500 text-white border-emerald-400'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          Adv: ₹{cust.advanceBalance}
                        </span>
                      )}
                    </div>

                    <div
                      className={`text-[11px] font-mono mt-0.5 ${
                        isSelected ? 'text-blue-100' : 'text-slate-500'
                      }`}
                    >
                      +91 {cust.phone}
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span
                      className={`text-[10px] block ${
                        isSelected ? 'text-blue-100' : 'text-slate-400'
                      }`}
                    >
                      Spend
                    </span>
                    <span
                      className={`text-xs font-bold font-mono ${
                        isSelected ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      ₹{cust.totalSpend.toFixed(0)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Customer Details & Purchase Ledger (Hidden on mobile when viewing list) */}
        <div className={`lg:col-span-7 ${mobileCustomerView === 'LIST' ? 'hidden lg:block' : 'block'}`}>
          {selectedCustomer ? (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 shadow-card space-y-5 sm:space-y-6">
              {/* Mobile Back to List Button */}
              <button
                onClick={() => setMobileCustomerView('LIST')}
                className="lg:hidden flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 pb-2 border-b border-slate-100"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>← Back to Customer List</span>
              </button>

              {/* Profile Card */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4 border-b border-slate-100 pb-4 sm:pb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-bold text-slate-900">{selectedCustomer.name}</h2>
                    <span className="bg-blue-50 text-blue-700 border border-blue-200/60 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                      Customer
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 flex-wrap">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono font-medium">+91 {selectedCustomer.phone}</span>
                    {selectedCustomer.email && <span>• {selectedCustomer.email}</span>}
                  </p>

                  {selectedCustomer.address && (
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{selectedCustomer.address}</span>
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-3 sm:flex sm:items-center gap-1.5 sm:gap-2 pt-1 sm:pt-0">
                  <button
                    onClick={() => setIsPaymentModalOpen(true)}
                    className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs shadow-xs shadow-emerald-500/20 transition active:scale-98 text-center"
                  >
                    <span className="hidden sm:inline">Record </span>Payment
                  </button>

                  <Link
                    href={`/pos?phone=${encodeURIComponent(selectedCustomer.phone)}`}
                    className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs shadow-xs shadow-blue-500/20 transition active:scale-98 text-center"
                  >
                    <span>New Bill</span>
                  </Link>

                  <button
                    onClick={() => {
                      setCustomerToEdit(selectedCustomer);
                      setIsCustomerModalOpen(true);
                    }}
                    className="px-2.5 sm:px-3 py-1.5 sm:py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition text-center"
                  >
                    Edit
                  </button>
                </div>
              </div>

              {/* 4 Metrics Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                <div className="p-2.5 sm:p-3 bg-slate-50/80 rounded-xl border border-slate-100">
                  <span className="text-[10px] sm:text-[11px] text-slate-400 block font-medium">Total Purchases</span>
                  <span className="text-xs sm:text-sm font-bold text-slate-900 font-mono mt-0.5 block">
                    ₹{selectedCustomer.totalSpend.toFixed(0)}
                  </span>
                </div>

                <div className="p-2.5 sm:p-3 bg-slate-50/80 rounded-xl border border-slate-100">
                  <span className="text-[10px] sm:text-[11px] text-slate-400 block font-medium">Total Bills</span>
                  <span className="text-xs sm:text-sm font-bold text-slate-900 font-mono mt-0.5 block">
                    {selectedCustomer.totalBills} Bills
                  </span>
                </div>

                <div className="p-2.5 sm:p-3 bg-emerald-50/70 rounded-xl border border-emerald-200/60">
                  <span className="text-[10px] sm:text-[11px] text-emerald-800 block font-medium">Advance</span>
                  <span className="text-xs sm:text-sm font-bold text-emerald-800 font-mono mt-0.5 block">
                    ₹{(selectedCustomer.advanceBalance || 0).toFixed(0)}
                  </span>
                </div>

                <div className="p-2.5 sm:p-3 bg-rose-50/70 rounded-xl border border-rose-200/60">
                  <span className="text-[10px] sm:text-[11px] text-rose-800 block font-medium">Due Balance</span>
                  <span className="text-xs sm:text-sm font-bold text-rose-700 font-mono mt-0.5 block">
                    ₹{(selectedCustomer.outstandingBalance || 0).toFixed(0)}
                  </span>
                </div>
              </div>

              {/* Purchase Bills History Table */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Purchase History ({customerInvoices.length})
                  </h3>

                  <Link
                    href={`/pos?phone=${encodeURIComponent(selectedCustomer.phone)}`}
                    className="text-xs text-blue-600 hover:underline font-semibold"
                  >
                    + Create Bill
                  </Link>
                </div>

                {customerInvoices.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-400 bg-slate-50 rounded-xl border border-slate-100">
                    No purchase bills found for this customer.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {customerInvoices.map((inv) => (
                      <div
                        key={inv.id}
                        className="p-2.5 sm:p-3 bg-slate-50/80 rounded-xl border border-slate-100 flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-mono font-bold text-blue-600 block">
                            {inv.invoiceNumber}
                          </span>
                          <span className="text-[10px] sm:text-[11px] text-slate-400">
                            {new Date(inv.date || inv.createdAt).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}{' '}
                            • {inv.items?.length || 1} item(s)
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="font-bold text-slate-900 font-mono block">
                              ₹{inv.grandTotal.toFixed(2)}
                            </span>
                            <span className="text-[10px] text-slate-500 font-semibold">
                              {inv.paymentMode}
                            </span>
                          </div>

                          <Link
                            href={`/invoice/${encodeURIComponent(inv.invoiceNumber)}`}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Print / View PDF Bill"
                          >
                            <Printer className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-12 text-center text-slate-400 shadow-card">
              <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="font-semibold text-slate-700">Select a Customer</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Click any customer on the left to view lifetime spend, credit ledger, and purchase invoices.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <CustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => {
          setIsCustomerModalOpen(false);
          setCustomerToEdit(null);
        }}
        customerToEdit={customerToEdit}
        onSaveCustomer={handleSaveCustomer}
      />

      <CustomerPaymentModal
        customer={selectedCustomer}
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onRecordTransaction={handleRecordKhata}
      />
    </div>
  );
}
