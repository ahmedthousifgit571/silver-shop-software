'use client';

import React, { useState, useEffect } from 'react';
import { X, UserPlus, CheckCircle2, Phone, Mail, MapPin, Building, Users } from 'lucide-react';
import { Customer } from '@/lib/types';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerToEdit?: Customer | null;
  initialPhone?: string;
  onSaveCustomer: (customerData: Partial<Customer>) => void;
}

export default function CustomerModal({
  isOpen,
  onClose,
  customerToEdit,
  initialPhone = '',
  onSaveCustomer,
}: CustomerModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [gstin, setGstin] = useState('');
  const [pan, setPan] = useState('');

  useEffect(() => {
    if (customerToEdit) {
      setName(customerToEdit.name);
      setPhone(customerToEdit.phone);
      setEmail(customerToEdit.email || '');
      setAddress(customerToEdit.address || '');
      setGstin(customerToEdit.gstin || '');
      setPan(customerToEdit.pan || '');
    } else {
      setName('');
      setPhone(initialPhone || '');
      setEmail('');
      setAddress('');
      setGstin('');
      setPan('');
    }
  }, [customerToEdit, initialPhone, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveCustomer({
      id: customerToEdit ? customerToEdit.id : undefined,
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      address: address.trim() || undefined,
      gstin: gstin.trim() || undefined,
      pan: pan.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white border border-slate-200 w-full max-w-lg rounded-2xl p-6 shadow-modal relative text-slate-900">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-5 pb-3 border-b border-slate-100">
          <div className="p-2.5 bg-slate-100 text-slate-700 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {customerToEdit ? 'Edit Customer Profile' : 'Add New Customer Profile'}
            </h2>
            <p className="text-xs text-slate-500">
              Customer contact details, address, and Khata credit account.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Customer Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Rajesh Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mobile Number *
              </label>
              <input
                type="tel"
                required
                placeholder="e.g. 9845012345"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono font-medium focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              placeholder="e.g. customer@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Address / Town
            </label>
            <input
              type="text"
              placeholder="e.g. 4th Block, Jayanagar, Bengaluru"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">GSTIN (Optional)</label>
              <input
                type="text"
                placeholder="e.g. 29ABCDE1234F1Z5"
                value={gstin}
                onChange={(e) => setGstin(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-mono uppercase focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">PAN Card (Optional)</label>
              <input
                type="text"
                placeholder="e.g. ABCDE1234F"
                value={pan}
                onChange={(e) => setPan(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-mono uppercase focus:outline-none"
              />
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
              className="flex items-center gap-2 px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs shadow-xs transition active:scale-98"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{customerToEdit ? 'Save Changes' : 'Save Customer Profile'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
