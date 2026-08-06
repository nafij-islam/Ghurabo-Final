'use client';

import React, { useState } from 'react';
import { Camera, Image as ImageIcon, User, MapPin, Sparkles, Check, X, Upload } from 'lucide-react';
import { IUser } from '@/types';

interface EditProfileModalProps {
  user: IUser;
  onClose: () => void;
  onSuccess: (updatedUser: IUser) => void;
}

export default function EditProfileModal({ user, onClose, onSuccess }: EditProfileModalProps) {
  const [name, setName] = useState(user.name || '');
  const [avatar, setAvatar] = useState(user.avatar || '');
  const [coverImage, setCoverImage] = useState(user.coverImage || '');
  const [bio, setBio] = useState(user.bio || '');
  const [location, setLocation] = useState(user.location || '');
  const [preferredStyle, setPreferredStyle] = useState<string>(user.preferredStyle || 'Solo');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleFileUpload = async (file: File, type: 'avatar' | 'cover') => {
    if (type === 'avatar') setUploadingAvatar(true);
    else setUploadingCover(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        if (type === 'avatar') setAvatar(data.url);
        else setCoverImage(data.url);
      }
    } catch (err) {
      console.warn('Image upload failed:', err);
    }

    if (type === 'avatar') setUploadingAvatar(false);
    else setUploadingCover(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          avatar,
          coverImage,
          bio,
          location,
          preferredStyle,
        }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        onSuccess(data.user);
        onClose();
      } else {
        setError(data.error || 'Failed to update profile.');
      }
    } catch (err) {
      setError('An error occurred updating profile.');
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="max-w-xl w-full bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6 relative my-8">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-6 h-6 text-brand-500" />
            <h2 className="font-display text-2xl font-bold uppercase text-slate-900">Edit Profile Details</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-600 text-xs font-semibold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Avatar Upload Preview */}
          <div className="flex items-center space-x-4">
            <div className="relative group">
              <img
                src={avatar || 'https://i.pravatar.cc/150'}
                alt="Avatar Preview"
                className="w-20 h-20 rounded-full object-cover border-2 border-brand-500 shadow"
              />
              <label className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-6 h-6 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFileUpload(f, 'avatar');
                  }}
                />
              </label>
            </div>

            <div className="flex-1 space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase block">Profile Photo (Avatar)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Paste photo URL or click upload"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                />
                <label className="px-3 py-2.5 bg-brand-50 hover:bg-brand-100 text-brand-600 font-bold text-xs rounded-xl cursor-pointer flex items-center space-x-1 whitespace-nowrap">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingAvatar ? 'Uploading...' : 'Upload'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleFileUpload(f, 'avatar');
                    }}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Cover Image Upload */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase block">Cover Banner Image</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Paste cover banner image URL"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
              />
              <label className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer flex items-center space-x-1 whitespace-nowrap">
                <ImageIcon className="w-3.5 h-3.5" />
                <span>{uploadingCover ? 'Uploading...' : 'Upload Banner'}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFileUpload(f, 'cover');
                  }}
                />
              </label>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-bold"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Bio / About Yourself</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell fellow travellers about your journey & adventures..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Home Location */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Home Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Dhaka, Bangladesh"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
              />
            </div>

            {/* Travel Style */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Preferred Travel Style</label>
              <select
                value={preferredStyle}
                onChange={(e) => setPreferredStyle(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
              >
                <option value="Solo">Solo Explorer</option>
                <option value="Couple">Couple Traveller</option>
                <option value="Family">Family Vacationer</option>
                <option value="Group">Group Backpacker</option>
              </select>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase rounded-full transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-7 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs uppercase tracking-wider rounded-full shadow-lg transition-all"
            >
              {saving ? 'Saving Changes...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
