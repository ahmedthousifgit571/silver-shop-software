'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import confetti from 'canvas-confetti';
import {
  ShoppingCart,
  QrCode,
  Search,
  Plus,
  Minus,
  Trash2,
  Receipt,
  Phone,
  RotateCcw,
  CheckCircle2,
  UserPlus,
  FileText,
  Percent,
  Wallet,
  ArrowRight,
  Sparkles,
  Scale,
  ShoppingBag,
} from 'lucide-react';
import BarcodeScannerModal from '@/components/BarcodeScannerModal';
import CustomerModal from '@/components/CustomerModal';
import PDFInvoiceView from '@/components/PDFInvoiceView';
import { Product, SilverRates, CartItem, Customer, Invoice, OldSilverExchange, ShopConfig, InvoiceType } from '@/lib/types';
import { initialProducts, initialRates, initialCustomers, initialShopConfig } from '@/lib/storage';

const CATEGORIES = ['All', 'Anklets', 'Rings', 'Chains', 'Utensils', 'Idols', 'Coins'];

function POSBillingContent() {
  const searchParams = useSearchParams();
  const phoneParam = searchParams.get('phone') || '';
  const skuParam = searchParams.get('sku') || '';

  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [rates, setRates] = useState<SilverRates>(initialRates);
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Mobile View Switcher: 'CATALOG' vs 'BILL'
  const [mobileTab, setMobileTab] = useState<'CATALOG' | 'BILL'>('CATALOG');

  // Bill Format Toggle
  const [invoiceType, setInvoiceType] = useState<InvoiceType>('TAX_INVOICE');
  const [taxType, setTaxType] = useState<'INTRA_STATE' | 'INTER_STATE' | 'NONE'>('INTRA_STATE');

  // Customer State
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [selectedCustomerObj, setSelectedCustomerObj] = useState<Customer | null>(null);
  const [matchedCustomers, setMatchedCustomers] = useState<Customer[]>([]);

  // Advance Adjustment
  const [useAdvanceBalance, setUseAdvanceBalance] = useState(false);

  // Old Silver Scrap Exchange
  const [hasOldSilver, setHasOldSilver] = useState(false);
  const [oldSilver, setOldSilver] = useState<OldSilverExchange>({
    grossWeight: 0,
    purityPercentage: 80,
    meltRatePerGram: initialRates.scrapRateBuyback,
    totalValue: 0,
  });

  // Billing adjustments
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState<'UPI' | 'CASH' | 'CARD' | 'SPLIT' | 'KHATA' | 'ADVANCE_ADJUST'>('UPI');
  const [billNotes, setBillNotes] = useState('');

  // Post Checkout
  const [completedInvoice, setCompletedInvoice] = useState<Invoice | null>(null);

  // Modals
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);

  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data);
          if (skuParam) {
            const found = data.find((p: Product) => p.sku.toLowerCase() === skuParam.toLowerCase());
            if (found) addToCart(found);
          }
        }
      })
      .catch(() => {});

    fetch('/api/rates')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.fineRate999) {
          setRates(data);
          setOldSilver((prev) => ({ ...prev, meltRatePerGram: data.scrapRateBuyback }));
        }
      })
      .catch(() => {});

    fetch('/api/customers')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setCustomers(data);
          if (phoneParam) {
            const found = data.find((c: Customer) => c.phone === phoneParam);
            if (found) {
              setCustomerPhone(found.phone);
              setCustomerName(found.name);
              setCustomerAddress(found.address || '');
              setSelectedCustomerObj(found);
            } else {
              setCustomerPhone(phoneParam);
            }
          }
        }
      })
      .catch(() => {});
  }, [phoneParam, skuParam]);

  const handlePhoneChange = (phoneInput: string) => {
    setCustomerPhone(phoneInput);
    if (phoneInput.length >= 2) {
      const matches = customers.filter(
        (c) => c.phone.includes(phoneInput) || c.name.toLowerCase().includes(phoneInput.toLowerCase())
      );
      setMatchedCustomers(matches);
      const exact = customers.find((c) => c.phone === phoneInput);
      if (exact) {
        setCustomerName(exact.name);
        setCustomerAddress(exact.address || '');
        setSelectedCustomerObj(exact);
      } else {
        setSelectedCustomerObj(null);
      }
    } else {
      setMatchedCustomers([]);
      setSelectedCustomerObj(null);
    }
  };

  const selectCustomer = (c: Customer) => {
    setCustomerPhone(c.phone);
    setCustomerName(c.name);
    setCustomerAddress(c.address || '');
    setSelectedCustomerObj(c);
    setMatchedCustomers([]);
  };

  const getProductRate = (purity: number): number => {
    if (purity >= 99) return rates.fineRate999;
    if (purity <= 85) return rates.utensilRate800;
    return rates.sterlingRate925;
  };

  const getWastageAndMaking = (product: Product, quantity = 1) => {
    const applicableRate = getProductRate(product.purity);
    const metalVal = product.netWeight * applicableRate * quantity;
    const wastage = metalVal * ((product.wastagePercentage || 0) / 100);

    let making = 0;
    if (product.makingChargeType === 'PER_GRAM') {
      making = product.netWeight * product.makingChargeValue * quantity;
    } else if (product.makingChargeType === 'FLAT') {
      making = product.makingChargeValue * quantity;
    } else {
      making = metalVal * (product.makingChargeValue / 100);
    }

    return { metalVal, wastage, making, total: metalVal + wastage + making };
  };

  const addToCart = (product: Product) => {
    const existingIndex = cart.findIndex((item) => item.product.sku === product.sku);
    const applicableRate = getProductRate(product.purity);

    if (existingIndex > -1) {
      const updated = [...cart];
      const newQty = updated[existingIndex].quantity + 1;
      const { wastage, making, total } = getWastageAndMaking(product, newQty);

      updated[existingIndex] = {
        ...updated[existingIndex],
        quantity: newQty,
        wastageAmount: wastage,
        makingCharge: making,
        totalPrice: total,
      };
      setCart(updated);
    } else {
      const { wastage, making, total } = getWastageAndMaking(product, 1);
      setCart([
        ...cart,
        {
          product,
          quantity: 1,
          silverRateApplied: applicableRate,
          wastageAmount: wastage,
          makingCharge: making,
          stoneCharge: 0,
          totalPrice: total,
        },
      ]);
    }
  };

  const updateQuantity = (sku: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.sku === sku) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            const { wastage, making, total } = getWastageAndMaking(item.product, newQty);
            return {
              ...item,
              quantity: newQty,
              wastageAmount: wastage,
              makingCharge: making,
              totalPrice: total,
            };
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (sku: string) => {
    setCart((prev) => prev.filter((item) => item.product.sku !== sku));
  };

  const handleOldSilverChange = (field: keyof OldSilverExchange, value: number) => {
    const updated = { ...oldSilver, [field]: value };
    const netGrams = updated.grossWeight * (updated.purityPercentage / 100);
    updated.totalValue = netGrams * updated.meltRatePerGram;
    setOldSilver(updated);
  };

  // Totals
  const subtotal = cart.reduce((acc, item) => acc + item.totalPrice, 0);
  const totalWastage = cart.reduce((acc, item) => acc + (item.wastageAmount || 0), 0);
  const totalMaking = cart.reduce((acc, item) => acc + item.makingCharge, 0);
  const totalNetGrams = cart.reduce((acc, item) => acc + item.product.netWeight * item.quantity, 0);
  const oldSilverDeduction = hasOldSilver ? oldSilver.totalValue : 0;
  const taxableAmount = Math.max(0, subtotal - discountAmount - oldSilverDeduction);

  let cgst = 0;
  let sgst = 0;
  let igst = 0;

  if (invoiceType === 'TAX_INVOICE') {
    if (taxType === 'INTER_STATE') {
      igst = taxableAmount * 0.03;
    } else {
      cgst = taxableAmount * 0.015;
      sgst = taxableAmount * 0.015;
    }
  }

  const totalPayable = taxableAmount + cgst + sgst + igst;
  const advanceAvailable = selectedCustomerObj?.advanceBalance || 0;
  const advanceDeduction = useAdvanceBalance ? Math.min(advanceAvailable, totalPayable) : 0;
  const grandTotal = Math.max(0, totalPayable - advanceDeduction);

  const costOfGoodsSold = cart.reduce((acc, item) => {
    const costPerGram = item.product.purchaseRatePerGram || 72.0;
    return acc + costPerGram * item.product.netWeight * item.quantity;
  }, 0);
  const profit = Math.max(0, taxableAmount - costOfGoodsSold);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    if (!customerPhone.trim() || !customerName.trim()) {
      alert('Please enter Customer Name and Mobile Number');
      return;
    }

    const invoicePayload = {
      invoiceType,
      taxType: invoiceType === 'TAX_INVOICE' ? taxType : 'NONE',
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerAddress: customerAddress.trim() || undefined,
      subtotal,
      wastageTotal: totalWastage,
      makingCharges: totalMaking,
      discount: discountAmount,
      oldSilver: hasOldSilver ? oldSilver : undefined,
      taxableAmount,
      cgst,
      sgst,
      igst,
      grandTotal,
      paymentMode: useAdvanceBalance && grandTotal === 0 ? 'ADVANCE_ADJUST' : paymentMode,
      costOfGoodsSold,
      profit,
      notes: billNotes.trim() || undefined,
      items: cart.map((item) => ({
        productSku: item.product.sku,
        productName: item.product.name,
        quantity: item.quantity,
        grossWeight: item.product.grossWeight,
        netWeight: item.product.netWeight,
        purity: item.product.purity,
        silverRateApplied: item.silverRateApplied,
        wastageAmount: item.wastageAmount,
        makingCharge: item.makingCharge,
        totalPrice: item.totalPrice,
        hsnCode: '7113',
      })),
    };

    try {
      const res = await fetch('/api/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoicePayload),
      });
      const data = await res.json();
      setCompletedInvoice(data);

      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch (ce) {}

      setProducts((prev) =>
        prev.map((p) => {
          const inCart = cart.find((c) => c.product.sku === p.sku);
          if (inCart) {
            return { ...p, stockQuantity: Math.max(0, p.stockQuantity - inCart.quantity) };
          }
          return p;
        })
      );
    } catch (err) {
      console.error('Checkout error:', err);
    }
  };

  if (completedInvoice) {
    return (
      <PDFInvoiceView
        invoice={completedInvoice}
        config={initialShopConfig}
        onBack={() => {
          setCompletedInvoice(null);
          setCart([]);
          setCustomerName('');
          setCustomerPhone('');
          setCustomerAddress('');
          setHasOldSilver(false);
          setDiscountAmount(0);
          setUseAdvanceBalance(false);
        }}
      />
    );
  }

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
      {/* Mobile Tab Switcher (Visible on < lg screens) */}
      <div className="flex lg:hidden items-center bg-slate-200/80 p-1 rounded-2xl mb-4 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setMobileTab('CATALOG')}
          className={`flex-1 py-2 rounded-xl text-center transition flex items-center justify-center gap-1.5 ${
            mobileTab === 'CATALOG'
              ? 'bg-white text-blue-700 shadow-xs'
              : 'text-slate-600'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Items Catalogue</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('BILL')}
          className={`flex-1 py-2 rounded-xl text-center transition flex items-center justify-center gap-1.5 ${
            mobileTab === 'BILL'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600'
          }`}
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>Current Bill ({cart.length}) • ₹{grandTotal.toFixed(0)}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Fast Product Search & Grid (7 cols) */}
        <div className={`lg:col-span-7 space-y-4 ${mobileTab === 'BILL' ? 'hidden lg:block' : 'block'}`}>
          {/* Search & Category Filter */}
          <div className="bg-white border border-slate-200/90 p-3.5 sm:p-4 rounded-2xl shadow-card space-y-3">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name or SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl pl-10 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none transition font-medium"
                />
              </div>

              <button
                onClick={() => setIsScannerOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/80 rounded-xl text-xs font-semibold transition flex-shrink-0 shadow-2xs"
                title="Camera QR Scanner"
              >
                <QrCode className="w-4 h-4 text-blue-600" />
                <span className="hidden sm:inline">Scan QR</span>
              </button>
            </div>

            <div className="flex items-center gap-1 overflow-x-auto pb-0.5 text-xs no-scrollbar">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-lg font-semibold transition whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white shadow-2xs shadow-blue-500/20'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/60'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 max-h-[calc(100vh-230px)] overflow-y-auto pr-1">
            {filteredProducts.map((product) => {
              const { total } = getWastageAndMaking(product, 1);
              const isOutOfStock = product.stockQuantity <= 0;

              return (
                <button
                  key={product.id}
                  onClick={() => !isOutOfStock && addToCart(product)}
                  disabled={isOutOfStock}
                  className="p-2.5 sm:p-3 rounded-2xl bg-white hover:bg-slate-50/80 border border-slate-200/90 hover:border-blue-300 transition text-left flex flex-col justify-between group disabled:opacity-40 disabled:cursor-not-allowed shadow-card"
                >
                  <div className="w-full">
                    <div className="relative aspect-video w-full rounded-xl overflow-hidden mb-1.5 sm:mb-2 bg-slate-100">
                      <img
                        src={
                          product.imageUrl ||
                          'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&auto=format&fit=crop&q=80'
                        }
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition"
                      />
                      <span className="absolute top-1 left-1 bg-amber-500 text-white text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                        {product.purity}%
                      </span>
                    </div>

                    <span className="text-[9px] sm:text-[10px] text-slate-400 font-mono block">{product.sku}</span>
                    <h4 className="font-semibold text-slate-900 text-xs line-clamp-1 group-hover:text-blue-600">
                      {product.name}
                    </h4>
                  </div>

                  <div className="w-full mt-1.5 pt-1.5 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[10px] sm:text-[11px] text-slate-500 font-mono">{product.netWeight}g</span>
                    <span className="font-bold text-slate-900 font-mono text-xs">
                      ₹{total.toFixed(0)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: Active Cart / Bill Summary (5 cols) */}
        <div className={`lg:col-span-5 bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-card space-y-4 ${mobileTab === 'CATALOG' ? 'hidden lg:block' : 'block'}`}>
          {/* Bill Type Header */}
          <div className="space-y-3 pb-3 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <div className="p-1 rounded-md bg-blue-50 text-blue-600">
                  <Receipt className="w-4 h-4" />
                </div>
                <span>Current Bill</span>
              </h2>

              <span className="text-xs font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60">
                {totalNetGrams.toFixed(2)} g silver
              </span>
            </div>

            {/* 3-Way Bill Format Toggle with macOS Style Badges */}
            <div className="grid grid-cols-3 gap-1.5 bg-slate-100/80 p-1 rounded-xl text-xs">
              <button
                type="button"
                onClick={() => {
                  setInvoiceType('TAX_INVOICE');
                  setTaxType('INTRA_STATE');
                }}
                className={`py-1 rounded-lg font-bold transition ${
                  invoiceType === 'TAX_INVOICE'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                GST (3%)
              </button>
              <button
                type="button"
                onClick={() => {
                  setInvoiceType('NON_GST_BILL');
                  setTaxType('NONE');
                }}
                className={`py-1 rounded-lg font-bold transition ${
                  invoiceType === 'NON_GST_BILL'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Non-GST
              </button>
              <button
                type="button"
                onClick={() => {
                  setInvoiceType('ESTIMATE_QUOTATION');
                  setTaxType('NONE');
                }}
                className={`py-1 rounded-lg font-bold transition ${
                  invoiceType === 'ESTIMATE_QUOTATION'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Estimate
              </button>
            </div>
          </div>

          {/* Customer Select Form */}
          <div className="space-y-2 relative">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 flex items-center gap-1">
                <Phone className="w-3 h-3 text-blue-500" />
                <span>Customer Mobile *</span>
              </span>
              <button
                type="button"
                onClick={() => setIsCustomerModalOpen(true)}
                className="text-blue-600 hover:text-blue-700 font-semibold text-xs"
              >
                + New Customer
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <input
                type="tel"
                placeholder="Mobile (e.g. 98450)"
                value={customerPhone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none font-medium"
              />
              <input
                type="text"
                placeholder="Customer Name *"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none font-medium"
              />
            </div>

            {/* Customer Dropdown */}
            {matchedCustomers.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-20 bg-white border border-slate-200 rounded-xl shadow-lg mt-1 overflow-hidden">
                {matchedCustomers.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => selectCustomer(c)}
                    className="w-full px-3 py-2 text-left hover:bg-blue-50 text-xs flex justify-between items-center border-b border-slate-100 last:border-0"
                  >
                    <span className="font-semibold text-slate-900">{c.name}</span>
                    <span className="text-blue-600 font-mono font-medium">+91 {c.phone}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Advance Balance Pill */}
            {selectedCustomerObj && selectedCustomerObj.advanceBalance > 0 && (
              <div className="flex items-center justify-between text-xs bg-emerald-50 p-2 rounded-xl border border-emerald-200">
                <span className="text-emerald-800 text-[11px]">
                  Advance: <strong>₹{selectedCustomerObj.advanceBalance}</strong>
                </span>
                <label className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-900 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useAdvanceBalance}
                    onChange={(e) => setUseAdvanceBalance(e.target.checked)}
                  />
                  <span>Use Advance</span>
                </label>
              </div>
            )}
          </div>

          {/* Cart Items List */}
          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
            {cart.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">
                <ShoppingCart className="w-6 h-6 mx-auto mb-1 text-slate-300" />
                <span>Cart is empty. Click products or scan barcode to add.</span>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.product.sku}
                  className="p-2.5 bg-slate-50/90 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs"
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <span className="font-semibold text-slate-900 block truncate">
                      {item.product.name}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {item.product.netWeight}g • ₹{item.silverRateApplied}/g • Making: ₹
                      {item.makingCharge.toFixed(0)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 bg-white border border-slate-200 px-1.5 py-0.5 rounded-lg shadow-2xs">
                    <button
                      onClick={() => updateQuantity(item.product.sku, -1)}
                      className="text-slate-400 hover:text-slate-900"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-bold text-slate-900 px-1 text-xs">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.sku, 1)}
                      className="text-slate-400 hover:text-slate-900"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="text-right pl-2 sm:pl-3">
                    <div className="font-bold text-slate-900 font-mono">
                      ₹{item.totalPrice.toFixed(0)}
                    </div>
                    <button
                      onClick={() => removeFromCart(item.product.sku)}
                      className="text-rose-500 hover:text-rose-700 text-[10px]"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Old Silver Scrap Buyback Accordion */}
          <div className="border-t border-slate-100 pt-2">
            <button
              type="button"
              onClick={() => setHasOldSilver(!hasOldSilver)}
              className="flex items-center justify-between w-full text-xs font-semibold text-amber-800 hover:text-amber-900 py-1"
            >
              <div className="flex items-center gap-1.5">
                <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                <span>Old Silver Scrap Buyback</span>
              </div>
              <span className="text-[10px] bg-amber-50 text-amber-800 px-2 py-0.5 rounded border border-amber-200">
                {hasOldSilver ? 'Hide' : '+ Add Scrap'}
              </span>
            </button>

            {hasOldSilver && (
              <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-200 mt-2 space-y-2 text-xs">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 block">Gross Wt (g)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={oldSilver.grossWeight}
                      onChange={(e) =>
                        handleOldSilverChange('grossWeight', parseFloat(e.target.value) || 0)
                      }
                      className="w-full bg-white border border-slate-200 rounded-lg p-1 text-xs text-slate-900 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block">Purity (%)</label>
                    <input
                      type="number"
                      step="1"
                      value={oldSilver.purityPercentage}
                      onChange={(e) =>
                        handleOldSilverChange('purityPercentage', parseFloat(e.target.value) || 0)
                      }
                      className="w-full bg-white border border-slate-200 rounded-lg p-1 text-xs text-slate-900 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block">Rate/g</label>
                    <input
                      type="number"
                      step="0.5"
                      value={oldSilver.meltRatePerGram}
                      onChange={(e) =>
                        handleOldSilverChange('meltRatePerGram', parseFloat(e.target.value) || 0)
                      }
                      className="w-full bg-white border border-slate-200 rounded-lg p-1 text-xs text-slate-900 font-mono"
                    />
                  </div>
                </div>
                <div className="flex justify-between items-center text-rose-600 font-semibold pt-1 text-xs">
                  <span>Deduction Value:</span>
                  <span>- ₹{oldSilver.totalValue.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Discount & Payment Method */}
          <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-100 pt-2">
            <div>
              <label className="text-[10px] text-slate-500 block mb-0.5">Discount (₹)</label>
              <input
                type="number"
                value={discountAmount}
                onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 font-mono font-medium"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-500 block mb-0.5">Payment Method</label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 font-semibold"
              >
                <option value="UPI">UPI (GPay / QR)</option>
                <option value="CASH">Cash in Drawer</option>
                <option value="CARD">Debit / Credit Card</option>
                <option value="KHATA">Khata / Credit</option>
              </select>
            </div>
          </div>

          {/* Final Calculations & Checkout Trigger */}
          <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-semibold text-slate-900 font-mono">₹{subtotal.toFixed(2)}</span>
            </div>

            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold font-mono">
                <span>Discount:</span>
                <span>- ₹{discountAmount.toFixed(2)}</span>
              </div>
            )}

            {oldSilverDeduction > 0 && (
              <div className="flex justify-between text-rose-600 font-semibold font-mono">
                <span>Old Silver Credit:</span>
                <span>- ₹{oldSilverDeduction.toFixed(2)}</span>
              </div>
            )}

            {invoiceType === 'TAX_INVOICE' && (
              <div className="flex justify-between text-slate-500">
                <span>GST (3%):</span>
                <span className="font-mono">₹{(cgst + sgst + igst).toFixed(2)}</span>
              </div>
            )}

            {advanceDeduction > 0 && (
              <div className="flex justify-between text-emerald-600 font-bold font-mono">
                <span>Advance Adjusted:</span>
                <span>- ₹{advanceDeduction.toFixed(2)}</span>
              </div>
            )}

            {/* Checkout Button in Apple Blue */}
            <button
              onClick={handleCheckout}
              disabled={cart.length === 0}
              className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold rounded-xl text-xs shadow-sm shadow-blue-500/20 transition active:scale-98 flex items-center justify-between mt-3"
            >
              <div className="text-left">
                <span className="text-[10px] uppercase font-semibold text-blue-100 block">
                  Total Payable ({cart.length} items)
                </span>
                <span className="text-base sm:text-lg font-mono font-bold">₹{grandTotal.toFixed(2)}</span>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-semibold bg-white/20 px-3 py-1.5 rounded-lg">
                <span>
                  {invoiceType === 'ESTIMATE_QUOTATION' ? 'Print Quote' : 'Complete Bill'}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Floating Bottom Bar on Mobile when Cart has items & User is in Catalog tab */}
      {cart.length > 0 && mobileTab === 'CATALOG' && (
        <div className="lg:hidden fixed bottom-3 left-3 right-3 z-30 animate-fade-in">
          <button
            onClick={() => setMobileTab('BILL')}
            className="w-full py-3 px-4 bg-blue-600 text-white font-bold rounded-2xl shadow-xl shadow-blue-500/30 flex items-center justify-between text-xs"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center font-mono text-xs">
                {cart.length}
              </div>
              <span>Items in Bill</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm">₹{grandTotal.toFixed(0)}</span>
              <span className="bg-white/20 px-2 py-1 rounded-lg text-[11px] font-semibold">
                Checkout →
              </span>
            </div>
          </button>
        </div>
      )}

      {/* Barcode Scanner Modal */}
      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={(scannedSku) => {
          const product = products.find((p) => p.sku.toLowerCase() === scannedSku.toLowerCase());
          if (product) addToCart(product);
          else alert(`Product with SKU ${scannedSku} not found!`);
        }}
      />

      {/* Customer Modal */}
      <CustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        initialPhone={customerPhone}
        onSaveCustomer={(newCust) => {
          const created = {
            ...newCust,
            id: `cust-${Date.now()}`,
            totalSpend: 0,
            totalBills: 0,
            advanceBalance: 0,
            outstandingBalance: 0,
            createdAt: new Date().toISOString(),
          } as Customer;
          setCustomers([created, ...customers]);
          selectCustomer(created);
        }}
      />
    </div>
  );
}

export default function POSBillingPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading Billing Counter...</div>}>
      <POSBillingContent />
    </Suspense>
  );
}
