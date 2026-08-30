'use client';

import React, { useState, useEffect } from 'react';
import { X, UploadCloud, Tag, CheckCircle2, DollarSign, Scale, Percent, Gem } from 'lucide-react';
import { Product, MakingChargeType, PurityGrade, MetalType } from '@/lib/types';
import { generateProductQRCode } from '@/lib/qr';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
  onSaveProduct: (productData: Partial<Product>) => void;
}

const CATEGORIES = [
  'Anklets',
  'Rings',
  'Chains',
  'Bangles & Bracelets',
  'Necklaces',
  'Earrings & Studs',
  'Utensils',
  'Pooja Articles',
  'Idols',
  'Coins & Bars',
  'Giftware',
];

export default function ProductModal({
  isOpen,
  onClose,
  productToEdit,
  onSaveProduct,
}: ProductModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Anklets');
  const [metalType, setMetalType] = useState<MetalType>('SILVER');
  const [sku, setSku] = useState('');
  const [description, setDescription] = useState('');
  const [grossWeight, setGrossWeight] = useState<number>(10.0);
  const [stoneWeight, setStoneWeight] = useState<number>(0.0);
  const [purity, setPurity] = useState<number>(92.5);
  const [purityGrade, setPurityGrade] = useState<PurityGrade>('925 Sterling');
  const [purchaseRatePerGram, setPurchaseRatePerGram] = useState<number>(72.0);
  const [wastagePercentage, setWastagePercentage] = useState<number>(2.0);
  const [makingChargeType, setMakingChargeType] = useState<MakingChargeType>('PER_GRAM');
  const [makingChargeValue, setMakingChargeValue] = useState<number>(50.0);
  const [gstPercentage, setGstPercentage] = useState<number>(3.0);
  const [stockQuantity, setStockQuantity] = useState<number>(5);
  const [minStockAlert, setMinStockAlert] = useState<number>(2);
  const [imageUrl, setImageUrl] = useState('');
  const [previewQr, setPreviewQr] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const netWeight = Math.max(0, grossWeight - stoneWeight);

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      setCategory(productToEdit.category || 'Anklets');
      setMetalType(productToEdit.metalType || 'SILVER');
      setSku(productToEdit.sku);
      setDescription(productToEdit.description || '');
      setGrossWeight(productToEdit.grossWeight);
      setStoneWeight(productToEdit.stoneWeight);
      setPurity(productToEdit.purity);
      setPurityGrade(productToEdit.purityGrade);
      setPurchaseRatePerGram(productToEdit.purchaseRatePerGram || 72.0);
      setWastagePercentage(productToEdit.wastagePercentage || 0.0);
      setMakingChargeType(productToEdit.makingChargeType);
      setMakingChargeValue(productToEdit.makingChargeValue);
      setGstPercentage(productToEdit.gstPercentage || 3.0);
      setStockQuantity(productToEdit.stockQuantity);
      setMinStockAlert(productToEdit.minStockAlert);
      setImageUrl(productToEdit.imageUrl || '');
    } else {
      const randomSuffix = Math.floor(100 + Math.random() * 900);
      const categoryCode = category.substring(0, 3).toUpperCase();
      const newSku = `SLV-${categoryCode}-925-${randomSuffix}`;
      setSku(newSku);
      setName('');
      setDescription('');
      setGrossWeight(10.0);
      setStoneWeight(0.0);
      setPurity(92.5);
      setPurityGrade('925 Sterling');
      setPurchaseRatePerGram(72.0);
      setWastagePercentage(2.0);
      setMakingChargeType('PER_GRAM');
      setMakingChargeValue(50.0);
      setGstPercentage(3.0);
      setStockQuantity(5);
      setMinStockAlert(2);
      setImageUrl('');
    }
  }, [productToEdit, isOpen]);

  useEffect(() => {
    if (sku) {
      generateProductQRCode(sku).then(setPreviewQr);
    }
  }, [sku]);

  const handleCategoryChange = (cat: string) => {
    setCategory(cat);
    if (!productToEdit) {
      const randomSuffix = Math.floor(100 + Math.random() * 900);
      const prefix = cat.substring(0, 3).toUpperCase();
      setSku(`SLV-${prefix}-${purityGrade.startsWith('999') ? '999' : '925'}-${randomSuffix}`);
    }
  };

  const handlePurityGradeChange = (grade: PurityGrade) => {
    setPurityGrade(grade);
    if (grade === '999 Fine') {
      setPurity(99.9);
      setPurchaseRatePerGram(82.0);
    } else if (grade === '925 Sterling') {
      setPurity(92.5);
      setPurchaseRatePerGram(72.0);
    } else if (grade === '800 Utensil') {
      setPurity(80.0);
      setPurchaseRatePerGram(63.0);
    }
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ file: base64 }),
        });
        const data = await res.json();
        if (data.url) setImageUrl(data.url);
        else setImageUrl(base64);
      } catch (err) {
        setImageUrl(base64);
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProduct({
      id: productToEdit ? productToEdit.id : undefined,
      sku: sku.trim().toUpperCase(),
      name: name.trim(),
      category,
      metalType,
      description: description.trim(),
      grossWeight: Number(grossWeight),
      stoneWeight: Number(stoneWeight),
      netWeight: Number(netWeight),
      purity: Number(purity),
      purityGrade,
      purchaseRatePerGram: Number(purchaseRatePerGram),
      wastagePercentage: Number(wastagePercentage),
      makingChargeType,
      makingChargeValue: Number(makingChargeValue),
      gstPercentage: Number(gstPercentage),
      stockQuantity: Number(stockQuantity),
      minStockAlert: Number(minStockAlert),
      imageUrl: imageUrl.trim() || undefined,
      qrCodeUrl: previewQr,
      isActive: true,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-3 sm:p-4 animate-fade-in overflow-y-auto">
      <div className="bg-white border border-slate-200/90 w-full max-w-2xl rounded-2xl p-4 sm:p-6 shadow-modal relative text-slate-900 my-4 sm:my-8 max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4 sm:mb-5 pb-3 border-b border-slate-100">
          <div className="p-2 bg-amber-50 text-amber-600 rounded-xl border border-amber-200/60">
            <Gem className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900">
              {productToEdit ? 'Edit Product Specifications' : 'Add New Jewellery Product'}
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500">
              Weights, purity, purchase cost basis, making charges, and stock.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
          {/* Row 1: Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Bridal Traditional Silver Payal"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category *</label>
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: SKU & QR Code Preview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 items-center bg-slate-50/80 p-3 sm:p-3.5 rounded-xl border border-slate-100">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Product SKU / Barcode *
              </label>
              <input
                type="text"
                required
                value={sku}
                onChange={(e) => setSku(e.target.value.toUpperCase())}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-mono font-bold focus:outline-none"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Encoded into printable jewelry stickers and invoices.
              </p>
            </div>

            <div className="flex flex-row sm:flex-col items-center justify-center gap-2 border-t sm:border-t-0 sm:border-l border-slate-200 pt-2 sm:pt-0 sm:pl-4">
              {previewQr ? (
                <img src={previewQr} alt="QR Preview" className="w-12 h-12 sm:w-14 sm:h-14 bg-white p-1 rounded-lg border border-slate-200" />
              ) : (
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-lg border border-slate-200 flex items-center justify-center text-[9px] text-slate-400">
                  QR
                </div>
              )}
              <span className="text-[9px] text-slate-400 font-mono">Barcode QR</span>
            </div>
          </div>

          {/* Row 3: Weight Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 bg-slate-50/80 p-3 sm:p-3.5 rounded-xl border border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Gross Wt (g) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={grossWeight}
                onChange={(e) => setGrossWeight(parseFloat(e.target.value) || 0)}
                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-bold focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Stone / Beads (g)</label>
              <input
                type="number"
                step="0.01"
                value={stoneWeight}
                onChange={(e) => setStoneWeight(parseFloat(e.target.value) || 0)}
                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Net Silver Wt</label>
              <div className="w-full bg-slate-200/70 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900 font-mono">
                {netWeight.toFixed(2)} g
              </div>
            </div>
          </div>

          {/* Row 4: Purchase Cost, Wastage & GST */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Purchase Cost (₹/g)
              </label>
              <input
                type="number"
                step="0.5"
                required
                value={purchaseRatePerGram}
                onChange={(e) => setPurchaseRatePerGram(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-mono font-semibold focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Wastage / VA (%)</label>
              <input
                type="number"
                step="0.5"
                value={wastagePercentage}
                onChange={(e) => setWastagePercentage(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-mono font-semibold focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">GST Rate (%)</label>
              <input
                type="number"
                step="0.5"
                value={gstPercentage}
                onChange={(e) => setGstPercentage(parseFloat(e.target.value) || 3.0)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-mono font-semibold focus:outline-none"
              />
            </div>
          </div>

          {/* Row 5: Purity Grade & Making Charges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Purity Standard</label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['925 Sterling', '999 Fine', '800 Utensil'] as PurityGrade[]).map((grade) => (
                  <button
                    key={grade}
                    type="button"
                    onClick={() => handlePurityGradeChange(grade)}
                    className={`py-1.5 px-1 sm:px-2 rounded-xl text-[11px] sm:text-xs font-semibold transition border ${
                      purityGrade === grade
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {grade.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Making Charges</label>
              <div className="flex items-center gap-2">
                <select
                  value={makingChargeType}
                  onChange={(e) => setMakingChargeType(e.target.value as MakingChargeType)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-2 sm:px-2.5 py-1.5 text-xs text-slate-900 font-medium"
                >
                  <option value="PER_GRAM">₹ / g</option>
                  <option value="FLAT">Flat ₹</option>
                  <option value="PERCENT">% Metal</option>
                </select>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={makingChargeValue}
                  onChange={(e) => setMakingChargeValue(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-bold font-mono"
                />
              </div>
            </div>
          </div>

          {/* Row 6: In-Stock & Photo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">In-Stock (Pcs) *</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-bold font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Low Alert At</label>
                <input
                  type="number"
                  min="1"
                  value={minStockAlert}
                  onChange={(e) => setMinStockAlert(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Product Photo</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Image URL"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900"
                />
                <label className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs cursor-pointer border border-slate-200 text-slate-700 flex items-center gap-1 flex-shrink-0">
                  <UploadCloud className="w-4 h-4" />
                  <input type="file" accept="image/*" onChange={handleImageFileChange} className="hidden" />
                </label>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs shadow-xs shadow-blue-500/20 transition active:scale-98"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{productToEdit ? 'Save Changes' : 'Create Product'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
