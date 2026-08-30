export type PurityGrade = '999 Fine' | '925 Sterling' | '800 Utensil' | '916 22K' | '750 18K' | 'Custom';
export type MakingChargeType = 'PER_GRAM' | 'FLAT' | 'PERCENT';
export type PaymentMode = 'CASH' | 'UPI' | 'CARD' | 'SPLIT' | 'KHATA' | 'ADVANCE_ADJUST';
export type InvoiceType = 'TAX_INVOICE' | 'NON_GST_BILL' | 'ESTIMATE_QUOTATION';
export type MetalType = 'SILVER' | 'GOLD' | 'DIAMOND' | 'UTENSIL';

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  metalType: MetalType;
  description?: string | null;
  grossWeight: number; // in grams
  stoneWeight: number; // in grams
  netWeight: number;   // in grams
  purity: number;      // e.g. 92.5, 99.9, 80.0
  purityGrade: PurityGrade;
  purchaseRatePerGram: number; // Purchase / Cost price per gram
  sellingPriceFixed?: number;  // Optional fixed price for coins/packaged items
  wastagePercentage: number;   // e.g. 2%, 5% wastage / VA
  makingChargeType: MakingChargeType;
  makingChargeValue: number;
  gstPercentage: number;       // default 3%
  imageUrl?: string | null;
  stockQuantity: number;
  minStockAlert: number;
  qrCodeUrl?: string | null;
  isActive: boolean;
  createdAt: string | Date;
  updatedAt?: string | Date;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  address?: string | null;
  gstin?: string | null;
  pan?: string | null;
  totalSpend: number;
  totalBills: number;
  advanceBalance: number;     // Customer advance money deposited
  outstandingBalance: number; // Credit / Udhar balance due
  createdAt: string | Date;
}

export interface KhataTransaction {
  id: string;
  customerId: string;
  date: string | Date;
  type: 'BILL_DEBIT' | 'PAYMENT_CREDIT' | 'ADVANCE_DEPOSIT';
  amount: number;
  paymentMode: string;
  referenceInvoice?: string;
  notes?: string;
}

export interface PurchaseStockIn {
  id: string;
  vendorName: string;
  date: string | Date;
  productSku: string;
  productName: string;
  quantity: number;
  weightGrams: number;
  purity: number;
  purchaseRatePerGram: number;
  totalCost: number;
  invoiceRef?: string;
  notes?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  silverRateApplied: number; // Rate per gram on sale
  wastageAmount: number;     // Wastage / VA charges
  makingCharge: number;      // Total making charge for this row
  stoneCharge: number;
  totalPrice: number;        // (metal + wastage + making) * qty
}

export interface OldSilverExchange {
  grossWeight: number;
  purityPercentage: number;
  meltRatePerGram: number;
  totalValue: number;
  description?: string;
}

export interface InvoiceItemSummary {
  id?: string;
  productId?: string;
  productName: string;
  productSku: string;
  quantity: number;
  grossWeight: number;
  netWeight: number;
  purity: number;
  silverRateApplied: number;
  wastageAmount?: number;
  makingCharge: number;
  stoneCharges?: number;
  totalPrice: number;
  hsnCode?: string;
  qrCodeUrl?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceType: InvoiceType;  // 'TAX_INVOICE' | 'NON_GST_BILL' | 'ESTIMATE_QUOTATION'
  taxType: 'INTRA_STATE' | 'INTER_STATE' | 'NONE'; // CGST+SGST vs IGST vs 0%
  customerId?: string | null;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  customerGstin?: string;
  date: string | Date;
  subtotal: number;
  wastageTotal: number;
  makingCharges: number;
  discount: number;
  oldSilver?: OldSilverExchange;
  taxableAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
  grandTotal: number;
  paymentMode: PaymentMode;
  paymentStatus: 'PAID' | 'PARTIAL' | 'DUE';
  paidAmount: number;
  costOfGoodsSold?: number;  // Total estimated product cost for profit reporting
  profit?: number;            // Net profit earned on this bill
  notes?: string | null;
  items: InvoiceItemSummary[];
  createdAt: string | Date;
}

export interface SilverRates {
  fineRate999: number;       // ₹/g
  sterlingRate925: number;   // ₹/g
  utensilRate800: number;    // ₹/g
  goldRate916?: number;      // ₹/g 22K gold rate
  scrapRateBuyback: number;  // ₹/g
  lastUpdated: string | Date;
}

export interface ShopConfig {
  shopName: string;
  tagline: string;
  gstin: string;
  hsnCode: string;
  phone: string;
  email: string;
  address: string;
  logoUrl?: string;
  terms: string;
}
