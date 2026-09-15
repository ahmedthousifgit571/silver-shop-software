'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Edit2,
  Trash2,
  Tag,
  CheckCircle2,
  AlertCircle,
  Search,
  Layers,
  ArrowRight,
  Sparkles,
  Boxes,
} from 'lucide-react';
import { Category } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';

interface CategoryManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCategoriesUpdated?: (categories: Category[]) => void;
}

export default function CategoryManagementModal({
  isOpen,
  onClose,
  onCategoriesUpdated,
}: CategoryManagementModalProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN' || user?.email === 'admin@gmail.com' || user?.email === '9333133334';

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Form State for Add / Edit
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [oldName, setOldName] = useState<string>('');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');

  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete confirmation
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (Array.isArray(data)) {
        setCategories(data);
        if (onCategoriesUpdated) onCategoriesUpdated(data);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      resetForm();
      setCategoryToDelete(null);
      setDeleteError(null);
    }
  }, [isOpen]);

  const resetForm = () => {
    setIsEditing(false);
    setEditId(null);
    setOldName('');
    setName('');
    setCode('');
    setDescription('');
    setFormError(null);
  };

  const handleStartEdit = (cat: Category) => {
    setIsEditing(true);
    setEditId(cat.id);
    setOldName(cat.name);
    setName(cat.name);
    setCode(cat.code || cat.name.slice(0, 3).toUpperCase());
    setDescription(cat.description || '');
    setFormError(null);
    setFormSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Category name is required');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);
    setFormSuccess(null);

    try {
      if (isEditing && editId) {
        // Update Category
        const res = await fetch('/api/categories', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editId,
            oldName,
            name: name.trim(),
            code: code.trim().toUpperCase(),
            description: description.trim() || undefined,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to update category');
        }

        setFormSuccess(`Category "${name}" updated successfully!`);
        resetForm();
        fetchCategories();
      } else {
        // Add Category
        const res = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            code: (code.trim() || name.trim().slice(0, 3)).toUpperCase(),
            description: description.trim() || undefined,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to create category');
        }

        setFormSuccess(`Category "${name}" added successfully!`);
        resetForm();
        fetchCategories();
      }
    } catch (err: any) {
      setFormError(err.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setFormSuccess(null), 3500);
    }
  };

  const handleDelete = async (cat: Category, force: boolean = false) => {
    setDeleteError(null);
    try {
      const res = await fetch(`/api/categories?id=${encodeURIComponent(cat.id)}&name=${encodeURIComponent(cat.name)}&force=${force}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.productCount > 0 && !force) {
          setCategoryToDelete(cat);
          setDeleteError(data.error);
          return;
        }
        throw new Error(data.error || 'Failed to delete category');
      }

      setCategoryToDelete(null);
      setFormSuccess(`Category "${cat.name}" removed.`);
      fetchCategories();
    } catch (err: any) {
      setDeleteError(err.message || 'Error deleting category');
    }
  };

  if (!isOpen) return null;

  const filteredCategories = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.code && c.code.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-3 sm:p-4 animate-fade-in">
      <div className="bg-white border border-slate-200 w-full max-w-3xl rounded-2xl shadow-modal overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-xs shadow-blue-600/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                  Product Category Management
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                  Admin Control
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Add, edit, and configure jewellery categories and automatic SKU prefixes.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Two Columns on desktop (Form on Left / Top, List on Right / Bottom) */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Form Alert Banners */}
          {formSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{formSuccess}</span>
            </div>
          )}

          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Delete Confirmation Warning */}
          {categoryToDelete && (
            <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl space-y-2 text-xs">
              <div className="flex items-center gap-2 text-amber-900 font-bold">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>Delete Category &quot;{categoryToDelete.name}&quot;?</span>
              </div>
              <p className="text-amber-800">
                {deleteError ||
                  `This category has ${categoryToDelete.productCount || 0} product(s) linked to it. Deleting it will reassign those products to 'Other'.`}
              </p>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setCategoryToDelete(null);
                    setDeleteError(null);
                  }}
                  className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(categoryToDelete, true)}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg shadow-2xs"
                >
                  Force Delete & Reassign
                </button>
              </div>
            </div>
          )}

          {/* Add / Edit Form Card */}
          <div className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200/60">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                {isEditing ? <Edit2 className="w-3.5 h-3.5 text-blue-600" /> : <Plus className="w-3.5 h-3.5 text-emerald-600" />}
                <span>{isEditing ? `Edit Category: ${oldName}` : 'Add New Category'}</span>
              </h3>

              {isEditing && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs text-slate-500 hover:text-slate-800 font-medium hover:underline"
                >
                  Cancel Editing
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Silver Coins, Nose Pins, Bridal Sets"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (!isEditing && !code) {
                        setCode(e.target.value.replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase());
                      }
                    }}
                    className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none transition shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    SKU Code Prefix (3-4 Chars)
                  </label>
                  <input
                    type="text"
                    maxLength={5}
                    placeholder="e.g. ANK, RNG"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2 text-xs font-mono font-bold text-blue-700 focus:outline-none transition shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Description / Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Daily wear payal, temple collection, hollow chains..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none transition shadow-2xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                {isEditing && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 font-semibold rounded-xl hover:bg-slate-100"
                  >
                    Reset
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold rounded-xl text-xs shadow-xs transition active:scale-98"
                >
                  {isEditing ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>{isEditing ? 'Save Changes' : 'Create Category'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Existing Categories List Table */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Store Categories ({categories.length})
                </h3>
                <p className="text-[11px] text-slate-500">
                  Active categories shown in POS filters, catalogue and product form.
                </p>
              </div>

              <div className="relative w-full sm:w-56">
                <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none"
                />
              </div>
            </div>

            <div className="border border-slate-200/90 rounded-2xl overflow-hidden bg-white shadow-card">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200/80 text-[11px]">
                      <th className="py-2.5 px-4">Category Name</th>
                      <th className="py-2.5 px-3">SKU Prefix</th>
                      <th className="py-2.5 px-3">Description</th>
                      <th className="py-2.5 px-3 text-center">Products</th>
                      <th className="py-2.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredCategories.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-xs text-slate-400">
                          {isLoading ? 'Loading categories...' : 'No categories match your search.'}
                        </td>
                      </tr>
                    ) : (
                      filteredCategories.map((cat) => (
                        <tr key={cat.id} className="hover:bg-slate-50/70 transition group">
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <Tag className="w-3.5 h-3.5 text-slate-400" />
                              <span>{cat.name}</span>
                            </div>
                          </td>

                          <td className="py-3 px-3 font-mono font-bold text-blue-700">
                            <span className="bg-blue-50 px-2 py-0.5 rounded border border-blue-200/60">
                              {cat.code || cat.name.slice(0, 3).toUpperCase()}
                            </span>
                          </td>

                          <td className="py-3 px-3 text-slate-500 max-w-xs truncate text-[11px]">
                            {cat.description || '—'}
                          </td>

                          <td className="py-3 px-3 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                                (cat.productCount || 0) > 0
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                  : 'bg-slate-100 text-slate-500'
                              }`}
                            >
                              {cat.productCount || 0} pcs
                            </span>
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleStartEdit(cat)}
                                className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                title="Edit category"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDelete(cat, false)}
                                className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                title="Delete category"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Logged in as Admin ({user?.email || '9333133334'})</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl shadow-2xs transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
