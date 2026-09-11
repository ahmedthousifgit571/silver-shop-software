'use client';

import React, { useState, useEffect } from 'react';
import { X, UploadCloud, Tag, CheckCircle2, DollarSign, Scale, Percent, Gem, Plus, Settings, Trash2 } from 'lucide-react';
import { Product, MakingChargeType, PurityGrade, MetalType, Category } from '@/lib/types';
import { generateProductQRCode } from '@/lib/qr';
import CategoryManagementModal from './CategoryManagementModal';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
  initialName?: string;
  onSaveProduct: (productData: Partial<Product>) => void;
  onDeleteProduct?: (product: Product) => void;
}

const DEFAULT_CATEGORIES = [
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
  initialName = '',
  onSaveProduct,
  onDeleteProduct,
}: ProductModalProps) {
  const [categoriesList, setCategoriesList] = useState<string[]>(DEFAULT_CATEGORIES);
  const [categoriesData, setCategoriesData] = useState<Category[]>([]);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

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

  const loadCategories = () => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setCategoriesData(data);
          setCategoriesList(data.map((c: any) => c.name));
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadCategories();
  }, []);

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
      const matchedCat = categoriesData.find((c) => c.name === category);
      const categoryCode = matchedCat?.code || category.substring(0, 3).toUpperCase();
      const newSku = `SLV-${categoryCode}-925-${randomSuffix}`;
      setSku(newSku);
      setName(initialName || '');
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
  }, [productToEdit, isOpen, initialName]);

  useEffect(() => {
    if (sku) {
      generateProductQRCode(sku).then(setPreviewQr);
    }
  }, [sku]);

  const handleCategoryChange = (cat: string) => {
    if (cat === '__NEW__') {
      setIsCategoryModalOpen(true);
      return;
    }
    setCategory(cat);
    if (!productToEdit) {
      const randomSuffix = Math.floor(100 + Math.random() * 900);
      const matchedCat = categoriesData.find((c) => c.name === cat);
      const prefix = matchedCat?.code || cat.substring(0, 3).toUpperCase();
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

  const sanitizeNum = (val: string): number => {
    const cleaned = val.replace(/[^0-9.]/g, '').replace(/^0+(?=\d)/, '');
    return cleaned === '' ? 0 : parseFloat(cleaned) || 0;
  };

  const handleNumericKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === '-' || e.key === '+' || e.key === 'e' || e.key === 'E') {
      e.preventDefault();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-3 sm:p-4 animate-fade-in">
      <div className="bg-white border border-slate-200/90 w-full max-w-2xl rounded-2xl p-5 sm:p-6 shadow-modal relative text-slate-900 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-5 pb-3 border-b border-slate-100">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100 shadow-2xs">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {productToEdit ? 'Edit Jewellery Product' : 'Add New Jewellery Item'}
            </h2>
            <p className="text-xs text-slate-500">
              Create product with instant SKU, weight breakdowns, and making charges.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Row 1: Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Item / Product Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Bridal Payal 92.5"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">Category</label>
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(true)}
                  className="text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                  title="Add, edit or delete categories"
                >
                  <Plus className="w-3 h-3" />
                  <span>Manage / Add Category</span>
                </button>
              </div>
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-semibold focus:outline-none"
              >
                {categoriesList.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
                <option value="__NEW__" className="text-blue-600 font-bold bg-blue-50">
                  + Add New Category...
                </option>
              </select>
            </div>
          </div>

          {/* Row 2: SKU & Metal Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">SKU / Code</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  required
                  value={sku}
                  onChange={(e) => setSku(e.target.value.toUpperCase())}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-slate-900 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    const randomSuffix = Math.floor(100 + Math.random() * 900);
                    const categoryCode = category.substring(0, 3).toUpperCase();
                    setSku(`SLV-${categoryCode}-925-${randomSuffix}`);
                  }}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold whitespace-nowrap transition"
                >
                  Generate
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Metal Type</label>
              <select
                value={metalType}
                onChange={(e) => setMetalType(e.target.value as MetalType)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-semibold focus:outline-none"
              >
                <option value="SILVER">Silver (Ag)</option>
                <option value="GOLD">Gold (Au)</option>
                <option value="PLATINUM">Platinum (Pt)</option>
                <option value="BULLION">Bullion / Coin</option>
              </select>
            </div>
          </div>

          {/* Row 3: Weight Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 bg-slate-50/80 p-3 sm:p-3.5 rounded-xl border border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Gross Wt (g) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                placeholder="0.00"
                value={grossWeight === 0 ? '' : grossWeight}
                onKeyDown={handleNumericKeyDown}
                onChange={(e) => setGrossWeight(sanitizeNum(e.target.value))}
                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-bold focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Stone / Beads (g)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={stoneWeight === 0 ? '' : stoneWeight}
                onKeyDown={handleNumericKeyDown}
                onChange={(e) => setStoneWeight(sanitizeNum(e.target.value))}
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
                min="0"
                required
                placeholder="0.0"
                value={purchaseRatePerGram === 0 ? '' : purchaseRatePerGram}
                onKeyDown={handleNumericKeyDown}
                onChange={(e) => setPurchaseRatePerGram(sanitizeNum(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-mono font-semibold focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Wastage / VA (%)</label>
              <input
                type="number"
                step="0.5"
                min="0"
                placeholder="0.0"
                value={wastagePercentage === 0 ? '' : wastagePercentage}
                onKeyDown={handleNumericKeyDown}
                onChange={(e) => setWastagePercentage(sanitizeNum(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-mono font-semibold focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">GST Rate (%)</label>
              <input
                type="number"
                step="0.5"
                min="0"
                placeholder="3.0"
                value={gstPercentage === 0 ? '' : gstPercentage}
                onKeyDown={handleNumericKeyDown}
                onChange={(e) => setGstPercentage(sanitizeNum(e.target.value))}
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
                  min="0"
                  required
                  placeholder="0.0"
                  value={makingChargeValue === 0 ? '' : makingChargeValue}
                  onKeyDown={handleNumericKeyDown}
                  onChange={(e) => setMakingChargeValue(sanitizeNum(e.target.value))}
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
                  placeholder="0"
                  value={stockQuantity === 0 ? '' : stockQuantity}
                  onKeyDown={handleNumericKeyDown}
                  onChange={(e) => setStockQuantity(sanitizeNum(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-bold font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Low Alert At</label>
                <input
                  type="number"
                  min="1"
                  placeholder="1"
                  value={minStockAlert === 0 ? '' : minStockAlert}
                  onKeyDown={handleNumericKeyDown}
                  onChange={(e) => setMinStockAlert(sanitizeNum(e.target.value) || 1)}
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

          <div className="flex items-center justify-between gap-2.5 pt-3 border-t border-slate-100">
            <div>
              {productToEdit && onDeleteProduct && (
                <button
                  type="button"
                  onClick={() => onDeleteProduct(productToEdit)}
                  className="flex items-center gap-1.5 px-3 py-2 text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 rounded-xl text-xs font-semibold transition active:scale-98"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Product</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2.5">
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
          </div>
        </form>
      </div>

      {/* Admin Category Management Modal */}
      <CategoryManagementModal
        isOpen={isCategoryModalOpen}
        onClose={() => {
          setIsCategoryModalOpen(false);
          loadCategories();
        }}
        onCategoriesUpdated={(updated) => {
          setCategoriesData(updated);
          const names = updated.map((u) => u.name);
          setCategoriesList(names);
          if (names.length > 0 && !names.includes(category)) {
            setCategory(names[0]);
          }
        }}
      />
    </div>
  );
}
