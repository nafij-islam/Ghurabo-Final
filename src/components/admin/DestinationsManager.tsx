'use client';

import React, { useState } from 'react';
import NextImage from 'next/image';
import Link from 'next/link';
import {
  MapPin,
  Star,
  Plus,
  Edit2,
  Trash2,
  X,
  Search,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Compass,
  ExternalLink,
  Eye,
  DollarSign,
  Image as ImageIcon,
} from 'lucide-react';
import { IDestination } from '@/types';
import { adminApi } from '@/lib/api/admin.api';

interface DestinationsManagerProps {
  destinations: IDestination[];
  onDataChanged: () => void;
  onTogglePopular: (destinationId: string, currentPopular: boolean) => void;
}

interface DestinationFormData {
  id?: string;
  name: string;
  category: string;
  city: string;
  country: string;
  averageDailyCostBDT: number;
  summary: string;
  description: string;
  coverImageUrl: string;
  bestTimeToVisit: string;
  weather: string;
  isFeatured: boolean;
}

const DEFAULT_FORM: DestinationFormData = {
  name: '',
  category: 'BEACH',
  city: '',
  country: 'Bangladesh',
  averageDailyCostBDT: 3500,
  summary: '',
  description: '',
  coverImageUrl: '',
  bestTimeToVisit: 'October to March',
  weather: '',
  isFeatured: false,
};

const CATEGORIES = [
  { label: 'Beach', value: 'BEACH' },
  { label: 'Mountain', value: 'MOUNTAIN' },
  { label: 'Island', value: 'ISLAND' },
  { label: 'Resort', value: 'RESORT' },
  { label: 'Nature', value: 'NATURE' },
  { label: 'Forest', value: 'FOREST' },
  { label: 'Historical', value: 'HISTORICAL' },
  { label: 'City', value: 'CITY' },
];

export default function DestinationsManager({
  destinations,
  onDataChanged,
  onTogglePopular,
}: DestinationsManagerProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<DestinationFormData>(DEFAULT_FORM);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Delete Confirmation State
  const [deleteTarget, setDeleteTarget] = useState<IDestination | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Feedback Banner
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData(DEFAULT_FORM);
    setFormError('');
    setModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (dest: IDestination) => {
    setEditingId(dest.id);
    setFormData({
      id: dest.id,
      name: dest.name,
      category: dest.category ? dest.category.toUpperCase() : 'BEACH',
      city: dest.division || '',
      country: dest.country || 'Bangladesh',
      averageDailyCostBDT: dest.avgCostSolo || 3500,
      summary: dest.description?.slice(0, 150) || '',
      description: dest.description || '',
      coverImageUrl: dest.image || '',
      bestTimeToVisit: dest.bestVisitingTime || 'October to March',
      weather: dest.safetyTips?.replace('Current conditions: ', '') || '',
      isFeatured: Boolean(dest.isPopular),
    });
    setFormError('');
    setModalOpen(true);
  };

  // Submit Form (Create or Edit)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('Destination name is required.');
      return;
    }
    if (!formData.city.trim()) {
      setFormError('City is required.');
      return;
    }
    if (!formData.description.trim()) {
      setFormError('Description is required.');
      return;
    }

    setFormLoading(true);
    setFormError('');

    try {
      const payload: any = {
        name: formData.name.trim(),
        category: formData.category,
        city: formData.city.trim(),
        country: formData.country.trim() || 'Bangladesh',
        averageDailyCostBDT: Number(formData.averageDailyCostBDT) || 3500,
        summary: formData.summary.trim() || formData.name.trim(),
        description: formData.description.trim(),
        bestTimeToVisit: formData.bestTimeToVisit.trim() || undefined,
        weather: formData.weather.trim() || undefined,
        isFeatured: formData.isFeatured,
      };

      if (formData.coverImageUrl.trim()) {
        payload.coverImage = {
          url: formData.coverImageUrl.trim(),
          caption: formData.name.trim(),
        };
      }

      if (editingId) {
        await adminApi.updateDestination(editingId, payload);
        setFeedback({
          type: 'success',
          message: `Destination "${formData.name}" successfully updated.`,
        });
      } else {
        await adminApi.createDestination(payload);
        setFeedback({
          type: 'success',
          message: `Destination "${formData.name}" successfully created.`,
        });
      }

      setModalOpen(false);
      onDataChanged();
    } catch (err: any) {
      console.error('Failed to save destination:', err);
      setFormError(
        err?.response?.data?.message ||
        err?.response?.data?.errors?.[0]?.message ||
        'Failed to save destination. Please check the inputs.'
      );
    } finally {
      setFormLoading(false);
    }
  };

  // Confirm Delete
  const handleDelete = async () => {
    if (!deleteTarget) return;

    setDeleteLoading(true);
    try {
      await adminApi.deleteDestination(deleteTarget.id);
      setFeedback({
        type: 'success',
        message: `Destination "${deleteTarget.name}" was permanently deleted.`,
      });
      setDeleteTarget(null);
      onDataChanged();
    } catch (err: any) {
      console.error('Failed to delete destination:', err);
      setFeedback({
        type: 'error',
        message: err?.response?.data?.message || 'Failed to delete destination.',
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  // Filtered destinations
  const filteredDestinations = destinations.filter((dest) => {
    const matchesSearch =
      !search.trim() ||
      dest.name.toLowerCase().includes(search.toLowerCase()) ||
      dest.division?.toLowerCase().includes(search.toLowerCase()) ||
      dest.country?.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      selectedCategory === 'ALL' ||
      dest.category?.toUpperCase() === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const popularCount = destinations.filter((d) => d.isPopular).length;

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 mb-10">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-display text-2xl font-bold uppercase text-slate-900 tracking-wide">
                Destinations Directory & Management
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-100 text-amber-800">
                {destinations.length} Total
              </span>
            </div>
            <p className="text-xs text-slate-500 font-light">
              Add, edit, or remove destinations. Control homepage popular destinations with one click.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 self-start md:self-auto">
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold uppercase tracking-wider shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Destination</span>
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl mb-6 text-xs font-medium flex items-center justify-between animate-fadeIn ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          <span>{feedback.message}</span>
          <button
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-slate-600 text-xs font-bold ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="relative sm:col-span-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search destination by name, city, or country..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </div>

        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          >
            <option value="ALL">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Destinations Table / Grid */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th className="py-3.5 px-4">Destination</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4">Location</th>
              <th className="py-3.5 px-4">Avg Daily Cost</th>
              <th className="py-3.5 px-4">Community Trips</th>
              <th className="py-3.5 px-4">Popular</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredDestinations.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  <Compass className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p className="font-semibold text-slate-600">No destinations found.</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Try searching for a different keyword or create a new destination above.
                  </p>
                </td>
              </tr>
            ) : (
              filteredDestinations.map((dest) => (
                <tr key={dest.id} className="hover:bg-slate-50/70 transition-colors">
                  {/* Destination Info */}
                  <td className="py-3.5 px-4 font-medium text-slate-900">
                    <div className="flex items-center space-x-3">
                      <NextImage
                        src={dest.image}
                        alt={dest.name || 'Destination image'}
                        width={44}
                        height={44}
                        className="w-11 h-11 rounded-xl object-cover border border-slate-200 shadow-sm shrink-0"
                      />
                      <div className="min-w-0">
                        <Link
                          href={`/destinations/${dest.slug}`}
                          target="_blank"
                          className="font-bold text-xs text-slate-900 hover:text-brand-600 transition-colors flex items-center space-x-1"
                        >
                          <span className="truncate">{dest.name}</span>
                          <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
                        </Link>
                        <span className="text-[10px] text-slate-400 block font-mono">
                          /{dest.slug}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Category Badge */}
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                      {dest.category}
                    </span>
                  </td>

                  {/* Location */}
                  <td className="py-3.5 px-4 text-slate-600">
                    <div className="flex items-center space-x-1 text-xs">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{dest.division ? `${dest.division}, ` : ''}{dest.country}</span>
                    </div>
                  </td>

                  {/* Average Daily Cost */}
                  <td className="py-3.5 px-4 font-semibold text-slate-800">
                    ৳{(dest.avgCostSolo || 0).toLocaleString()}
                  </td>

                  {/* Real Community Trips Count */}
                  <td className="py-3.5 px-4">
                    <Link
                      href={`/trips?destination=${dest.slug}`}
                      className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-cyan-50 text-cyan-800 border border-cyan-200 hover:bg-cyan-100 transition-colors"
                    >
                      <Compass className="w-3 h-3 text-cyan-600" />
                      <span>{dest.totalTrips || 0} Trips</span>
                    </Link>
                  </td>

                  {/* Popular Toggle Button */}
                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => onTogglePopular(dest.id, Boolean(dest.isPopular))}
                      className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all cursor-pointer ${
                        dest.isPopular
                          ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-sm'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-amber-50'
                      }`}
                      title={dest.isPopular ? 'Featured on Homepage' : 'Mark as popular'}
                    >
                      <Star className={`w-3 h-3 ${dest.isPopular ? 'fill-amber-500 text-amber-500' : 'text-slate-400'}`} />
                      <span>{dest.isPopular ? 'Popular' : 'Standard'}</span>
                    </button>
                  </td>

                  {/* Actions (Edit & Delete) */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end space-x-1">
                      <button
                        onClick={() => handleOpenEdit(dest)}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-brand-600 hover:border-brand-300 hover:bg-brand-50 transition-colors cursor-pointer"
                        title="Edit Destination"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(dest)}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-rose-600 hover:border-rose-300 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete Destination"
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

      {/* Modal: Create or Edit Destination */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm transition-opacity"
            onClick={() => !formLoading && setModalOpen(false)}
          />

          {/* Dialog Card */}
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 z-10 my-8">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center space-x-2">
                <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold uppercase text-slate-900 tracking-wide">
                    {editingId ? 'Edit Destination' : 'Add New Destination'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {editingId
                      ? 'Update destination details, pricing, and guidelines.'
                      : 'Create a new verified destination in Bangladesh.'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                disabled={formLoading}
                className="w-8 h-8 rounded-full bg-white hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium">
                  {formError}
                </div>
              )}

              {/* Name & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Destination Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kuakata Sea Beach"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* City, Country & Daily Cost */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    City / District *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Patuakhali"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    placeholder="Bangladesh"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Average Daily Cost (BDT) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="3500"
                    value={formData.averageDailyCostBDT}
                    onChange={(e) =>
                      setFormData({ ...formData, averageDailyCostBDT: Number(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>
              </div>

              {/* Cover Image URL */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Cover Image URL
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={formData.coverImageUrl}
                    onChange={(e) => setFormData({ ...formData, coverImageUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                  {formData.coverImageUrl && (
                    <NextImage
                      src={formData.coverImageUrl}
                      alt="Preview"
                      width={36}
                      height={36}
                      unoptimized={formData.coverImageUrl.startsWith('data:') || formData.coverImageUrl.startsWith('blob:')}
                      className="w-9 h-9 rounded-lg object-cover border border-slate-200 shrink-0"
                    />
                  )}
                </div>
              </div>

              {/* Summary */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Brief Summary / Tagline
                </label>
                <input
                  type="text"
                  placeholder="e.g. Daughter of the sea with sunset and sunrise views."
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>

              {/* Detailed Description */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Description *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detailed background, key highlights, and attraction overview..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 leading-relaxed"
                />
              </div>

              {/* Best Time & Weather */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Best Time to Visit
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. October to March"
                    value={formData.bestTimeToVisit}
                    onChange={(e) => setFormData({ ...formData, bestTimeToVisit: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Weather / Notes
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sunny with refreshing sea breezes"
                    value={formData.weather}
                    onChange={(e) => setFormData({ ...formData, weather: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>
              </div>

              {/* Popular Checkbox */}
              <div className="pt-2 flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isFeaturedDest"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
                />
                <label htmlFor="isFeaturedDest" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Feature in &ldquo;Popular Destinations&rdquo; on Homepage
                </label>
              </div>

              {/* Form Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  disabled={formLoading}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs uppercase tracking-wider flex items-center space-x-1.5 shadow-md transition-all disabled:opacity-60 cursor-pointer"
                >
                  {formLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingId ? 'Update Destination' : 'Create Destination'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm transition-opacity"
            onClick={() => !deleteLoading && setDeleteTarget(null)}
          />
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 border border-slate-100 z-10 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="font-display text-xl font-bold uppercase text-slate-900">
                Delete Destination?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Are you sure you want to permanently delete{' '}
                <span className="font-semibold text-slate-900">{deleteTarget.name}</span>? This action cannot be undone.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center space-x-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleteLoading}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 shadow-md transition-colors cursor-pointer"
              >
                {deleteLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Delete Permanently</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
