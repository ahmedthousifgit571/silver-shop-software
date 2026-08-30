'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShoppingCart,
  Plus,
  QrCode,
  Search,
  ArrowUpRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Boxes,
  Users,
  ChevronRight,
  Receipt,
  Gem,
  PackageCheck,
  Scale,
  DollarSign,
  ArrowRight,
  Coins,
} from 'lucide-react';
import { Product, SilverRates, Invoice, Customer } from '@/lib/types';
import { initialProducts, initialRates, initialInvoices, initialCustomers } from '@/lib/storage';
import { useAuth } from '@/context/AuthContext';

export default function DashboardOverviewPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [rates, setRates] = useState<SilverRates>(initialRates);
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [salesTab, setSalesTab] = useState<'TODAY' | 'WEEK' | 'MONTH'>('TODAY');

  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => Array.isArray(data) && data.length > 0 && setProducts(data))
      .catch(() => {});

    fetch('/api/rates')
      .then((res) => res.json())
      .then((data) => data && data.fineRate999 && setRates(data))
      .catch(() => {});

    fetch('/api/billing')
      .then((res) => res.json())
      .then((data) => Array.isArray(data) && data.length > 0 && setInvoices(data))
      .catch(() => {});

    fetch('/api/customers')
      .then((res) => res.json())
      .then((data) => Array.isArray(data) && data.length > 0 && setCustomers(data))
      .catch(() => {});
  }, []);

  // Today's Sales Calculation
  const todayStr = new Date().toISOString().split('T')[0];
  const todayInvoices = invoices.filter((inv) => {
    const d = new Date(inv.date || inv.createdAt).toISOString().split('T')[0];
    return d === todayStr;
  });

  const todayRevenue = todayInvoices.reduce((acc, inv) => acc + inv.grandTotal, 0);
  const todayBillsCount = todayInvoices.length;
  const todayItemsCount = todayInvoices.reduce(
    (acc, inv) => acc + (inv.items?.reduce((iAcc, item) => iAcc + (item.quantity || 1), 0) || 0),
    0
  );

  // Total Inventory Calculations
  const totalStockPieces = products.reduce((acc, p) => acc + p.stockQuantity, 0);
  const totalStockGrams = products.reduce((acc, p) => acc + p.netWeight * p.stockQuantity, 0);
  const totalStockValue = totalStockGrams * rates.sterlingRate925;

  // Alerts: Low Stock & Customer Dues
  const lowStockItems = products.filter((p) => p.stockQuantity <= p.minStockAlert);
  const customersWithDue = customers.filter((c) => (c.outstandingBalance || 0) > 0);
  const totalOutstandingDue = customersWithDue.reduce((acc, c) => acc + (c.outstandingBalance || 0), 0);

  // Payment Breakdown Today
  const upiCollected = todayInvoices
    .filter((i) => i.paymentMode === 'UPI')
    .reduce((acc, i) => acc + i.grandTotal, 0);
  const cashInDrawer = todayInvoices
    .filter((i) => i.paymentMode === 'CASH')
    .reduce((acc, i) => acc + i.grandTotal, 0);

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-8 py-5 sm:py-8 space-y-6 sm:space-y-8">
      {/* 1. Header with greeting and primary actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight">
            Good morning, {user?.name?.split(' ')[0] || 'Admin'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 font-normal">
            Here&apos;s what&apos;s happening in your silver shop today.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2">
          <Link
            href="/pos"
            className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs shadow-blue-500/20 transition active:scale-98"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Create Bill</span>
          </Link>

          <Link
            href="/products"
            className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold shadow-2xs transition"
          >
            <Plus className="w-3.5 h-3.5 text-slate-500" />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* 2. Today's Overview: 4-Column Metric Grid with Responsive Mobile Sizing */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Metric 1: Today's Sales */}
        <div className="bg-white border border-slate-200/90 p-3.5 sm:p-5 rounded-2xl shadow-card relative overflow-hidden group hover:border-emerald-200 transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-medium text-slate-500">Today&apos;s Sales</span>
            <span className="text-[9px] sm:text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 sm:px-2 py-0.5 rounded-full border border-emerald-200/60">
              +12%
            </span>
          </div>
          <div className="mt-1.5 sm:mt-2 text-lg sm:text-2xl font-bold text-slate-900 tracking-tight font-mono">
            ₹{todayRevenue.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </div>
          <span className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 sm:mt-1 block truncate">
            {todayBillsCount} bill(s) today
          </span>
        </div>

        {/* Metric 2: Bills Generated */}
        <div className="bg-white border border-slate-200/90 p-3.5 sm:p-5 rounded-2xl shadow-card hover:border-indigo-200 transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-medium text-slate-500">Bills Created</span>
            <div className="p-1 rounded-md bg-indigo-50 text-indigo-600">
              <Receipt className="w-3 h-3" />
            </div>
          </div>
          <div className="mt-1.5 sm:mt-2 text-lg sm:text-2xl font-bold text-slate-900 tracking-tight font-mono">
            {todayBillsCount}
          </div>
          <span className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 sm:mt-1 block truncate">
            Checkouts completed
          </span>
        </div>

        {/* Metric 3: Items Sold */}
        <div className="bg-white border border-slate-200/90 p-3.5 sm:p-5 rounded-2xl shadow-card hover:border-blue-200 transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-medium text-slate-500">Items Sold</span>
            <div className="p-1 rounded-md bg-blue-50 text-blue-600">
              <Gem className="w-3 h-3" />
            </div>
          </div>
          <div className="mt-1.5 sm:mt-2 text-lg sm:text-2xl font-bold text-slate-900 tracking-tight font-mono">
            {todayItemsCount} <span className="text-xs font-normal text-slate-400">pcs</span>
          </div>
          <span className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 sm:mt-1 block truncate">
            Silver pieces sold
          </span>
        </div>

        {/* Metric 4: Stock Valuation */}
        <div className="bg-white border border-slate-200/90 p-3.5 sm:p-5 rounded-2xl shadow-card hover:border-amber-200 transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-medium text-slate-500">Total Stock Value</span>
            <div className="p-1 rounded-md bg-amber-50 text-amber-600">
              <Coins className="w-3 h-3" />
            </div>
          </div>
          <div className="mt-1.5 sm:mt-2 text-lg sm:text-2xl font-bold text-slate-900 tracking-tight font-mono">
            ₹{(totalStockValue / 100000).toFixed(2)}L
          </div>
          <span className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 sm:mt-1 block truncate">
            {(totalStockGrams / 1000).toFixed(2)} kg in vault
          </span>
        </div>
      </div>

      {/* 3. Actionable Alerts Section */}
      {(lowStockItems.length > 0 || customersWithDue.length > 0) && (
        <div className="bg-amber-50/80 border border-amber-200/90 p-3.5 sm:p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-start sm:items-center gap-2.5 sm:gap-3">
            <div className="p-2 bg-amber-100/90 text-amber-800 rounded-xl flex-shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="text-xs text-amber-950 font-medium">
              {lowStockItems.length > 0 ? (
                <span>
                  <strong>{lowStockItems.length} products</strong> are running low on stock in the store vault.
                </span>
              ) : (
                <span>
                  <strong>₹{totalOutstandingDue.toFixed(0)}</strong> pending in customer Khata credit ledger.
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            {lowStockItems.length > 0 && (
              <Link
                href="/inventory"
                className="w-full sm:w-auto text-center px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg text-xs transition shadow-2xs"
              >
                Review Inventory
              </Link>
            )}
            {customersWithDue.length > 0 && (
              <Link
                href="/customers"
                className="w-full sm:w-auto text-center px-3 py-1.5 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 font-semibold rounded-lg text-xs transition shadow-2xs"
              >
                View Khata (Dues)
              </Link>
            )}
          </div>
        </div>
      )}

      {/* 4. Two-Column Split: Sales Overview + Inventory Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        {/* Left (7 cols): Sales Overview & Payment Splits */}
        <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 shadow-card space-y-4 sm:space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Sales Overview</h2>
              <p className="text-xs text-slate-500">Revenue reconciliation</p>
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
              <button
                onClick={() => setSalesTab('TODAY')}
                className={`px-2.5 sm:px-3 py-1 rounded-lg font-semibold transition text-xs ${
                  salesTab === 'TODAY' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-500'
                }`}
              >
                Today
              </button>
              <button
                onClick={() => setSalesTab('WEEK')}
                className={`px-2.5 sm:px-3 py-1 rounded-lg font-semibold transition text-xs ${
                  salesTab === 'WEEK' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-500'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setSalesTab('MONTH')}
                className={`px-2.5 sm:px-3 py-1 rounded-lg font-semibold transition text-xs ${
                  salesTab === 'MONTH' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-500'
                }`}
              >
                Month
              </button>
            </div>
          </div>

          {/* Revenue Highlight Card */}
          <div className="p-3.5 sm:p-4 bg-slate-50/80 rounded-xl border border-slate-100 flex items-center justify-between">
            <div>
              <span className="text-[11px] sm:text-xs text-slate-500 block">Total Revenue ({salesTab.toLowerCase()})</span>
              <div className="text-lg sm:text-xl font-bold text-slate-900 font-mono mt-0.5">
                ₹{todayRevenue.toFixed(2)}
              </div>
            </div>
            <Link
              href="/reports"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>Full Report</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Payment Split Rows */}
          <div className="space-y-2.5 pt-1 sm:pt-2">
            <span className="text-xs font-semibold text-slate-700 block">Payment Methods</span>
            
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              <div className="p-3 sm:p-3.5 bg-white border border-slate-200/90 rounded-xl flex items-center justify-between shadow-2xs">
                <div>
                  <span className="text-[10px] sm:text-[11px] text-slate-400 block font-medium">UPI / Digital</span>
                  <span className="text-xs sm:text-sm font-bold text-slate-900 font-mono">
                    ₹{upiCollected.toFixed(0)}
                  </span>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-blue-100 flex-shrink-0"></span>
              </div>

              <div className="p-3 sm:p-3.5 bg-white border border-slate-200/90 rounded-xl flex items-center justify-between shadow-2xs">
                <div>
                  <span className="text-[10px] sm:text-[11px] text-slate-400 block font-medium">Cash in Drawer</span>
                  <span className="text-xs sm:text-sm font-bold text-slate-900 font-mono">
                    ₹{cashInDrawer.toFixed(0)}
                  </span>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100 flex-shrink-0"></span>
              </div>
            </div>
          </div>
        </div>

        {/* Right (5 cols): Inventory Snapshot */}
        <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 shadow-card flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Inventory Snapshot</h2>
                <p className="text-xs text-slate-500">Vault weight & stock count</p>
              </div>
              <Link
                href="/inventory"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                View Inventory →
              </Link>
            </div>

            <div className="space-y-2.5 sm:space-y-3 text-xs">
              <div className="flex items-center justify-between py-1.5 sm:py-2 border-b border-slate-100">
                <span className="text-slate-500">Jewellery Designs</span>
                <span className="font-bold text-slate-900 font-mono">{products.length} Items</span>
              </div>

              <div className="flex items-center justify-between py-1.5 sm:py-2 border-b border-slate-100">
                <span className="text-slate-500">Vault Silver Wt</span>
                <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-mono border border-amber-200/60">
                  {(totalStockGrams / 1000).toFixed(2)} kg
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 sm:py-2 border-b border-slate-100">
                <span className="text-slate-500">Valuation</span>
                <span className="font-bold text-slate-900 font-mono">
                  ₹{(totalStockValue / 100000).toFixed(2)} Lakhs
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 sm:py-2">
                <span className="text-slate-500">Stock Status</span>
                <span className={`font-bold font-mono px-2 py-0.5 rounded border ${lowStockItems.length > 0 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                  {lowStockItems.length > 0 ? `${lowStockItems.length} items low` : 'Healthy'}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <Link
              href="/inventory"
              className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-2xs"
            >
              <Boxes className="w-3.5 h-3.5 text-teal-600" />
              <span>Manage Stock & Inward Logs</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 5. Recent Activity: Clean Data Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Recent Transactions</h2>
            <p className="text-xs text-slate-500">Latest retail bills generated at the counter</p>
          </div>

          <Link
            href="/reports"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>View all</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {invoices.length === 0 ? (
          <div className="text-center py-10 text-xs text-slate-400">
            No bills created yet today.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[500px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-slate-500 font-semibold uppercase text-[10px]">
                  <th className="py-2.5 px-3">Bill No.</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Items</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                  <th className="py-2.5 px-3 text-center">Payment</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.slice(0, 5).map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-3 font-mono font-bold text-blue-600">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-semibold text-slate-800 block">{inv.customerName}</span>
                      <span className="text-[11px] text-slate-400 font-mono">{inv.customerPhone}</span>
                    </td>
                    <td className="py-3 px-3 text-slate-500">
                      {inv.items?.length || 1} item(s)
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900 font-mono">
                      ₹{inv.grandTotal.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md text-[10px] font-semibold border border-slate-200/60">
                        {inv.paymentMode}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Link
                        href={`/invoice/${encodeURIComponent(inv.invoiceNumber)}`}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        View Bill
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
