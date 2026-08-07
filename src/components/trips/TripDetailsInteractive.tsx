'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, Bookmark, ThumbsUp, MessageSquare } from 'lucide-react';
import { ITrip, IComment } from '@/types';
import { getOptimizedImageUrl } from '@/lib/utils/cloudinary';

interface Props {
  trip: ITrip;
  initialHelpfulCount: number;
}

export function AuthorActions({ trip, initialHelpfulCount }: Props) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [helpfulCount, setHelpfulCount] = useState(initialHelpfulCount || 45);
  const router = useRouter();

  const verifyAuth = async (): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.success && data.user) return true;
    } catch (e) {}
    return false;
  };

  const handleLike = async () => {
    const isAuthed = await verifyAuth();
    if (!isAuthed) {
      router.push(`/auth/login?redirect=${encodeURIComponent(`/trips/${trip.slug || trip.id}`)}`);
      return;
    }
    setLiked(!liked);
    try {
      await fetch(`/api/trips/${trip.id || (trip as any)._id}`, {
        method: 'PUT',
        body: JSON.stringify({ action: 'like' }),
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (err) {}
  };

  const handleSave = async () => {
    const isAuthed = await verifyAuth();
    if (!isAuthed) {
      router.push(`/auth/login?redirect=${encodeURIComponent(`/trips/${trip.slug || trip.id}`)}`);
      return;
    }
    setSaved(!saved);
    try {
      await fetch(`/api/trips/${trip.id || (trip as any)._id}`, {
        method: 'PUT',
        body: JSON.stringify({ action: 'save' }),
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (err) {}
  };

  const handleHelpfulVote = async () => {
    setHelpfulCount(helpfulCount + 1);
    try {
      await fetch(`/api/trips/${trip.id || (trip as any)._id}`, {
        method: 'PUT',
        body: JSON.stringify({ action: 'helpful' }),
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (err) {}
  };

  return (
    <div className="flex items-center space-x-3">
      <button
        onClick={handleLike}
        className={`flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
          liked ? 'bg-rose-500 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-rose-50 hover:text-rose-600'
        }`}
      >
        <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
        <span>{liked ? 'Liked' : 'Like'}</span>
      </button>

      <button
        onClick={handleSave}
        className={`flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
          saved ? 'bg-amber-500 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-amber-50 hover:text-amber-600'
        }`}
      >
        <Bookmark className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
        <span>{saved ? 'Saved' : 'Save'}</span>
      </button>

      <button
        onClick={handleHelpfulVote}
        className="flex items-center space-x-1.5 px-4 py-2 rounded-full bg-brand-500 text-white hover:bg-brand-600 text-xs font-bold transition-all shadow-md cursor-pointer"
      >
        <ThumbsUp className="w-4 h-4" />
        <span>Helpful ({helpfulCount})</span>
      </button>
    </div>
  );
}

export function CommentsSection({ tripId }: { tripId: string }) {
  const [comments, setComments] = useState<IComment[]>([
    {
      id: 'c1',
      tripId,
      userId: 'user_2',
      userName: 'Tanvir & Sarah',
      userAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400',
      content: 'This itinerary is super clean! Thanks for sharing exact per-person costs.',
      createdAt: '2026-02-03T10:00:00Z',
    },
  ]);
  const [newComment, setNewComment] = useState('');

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      const added: IComment = {
        id: `c_${Date.now()}`,
        tripId,
        userId: 'user_current',
        userName: 'You (Explorer)',
        userAvatar: 'https://i.pravatar.cc/150?u=me',
        content: newComment.trim(),
        createdAt: new Date().toISOString(),
      };
      setComments([...comments, added]);
      setNewComment('');
    }
  };

  return (
    <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-sm border border-slate-100 mb-12">
      <h2 className="font-display text-3xl font-bold text-slate-900 uppercase mb-6 flex items-center space-x-2">
        <MessageSquare className="w-6 h-6 text-brand-500" />
        <span>Community Discussion ({comments.length})</span>
      </h2>

      <form onSubmit={handleAddComment} className="mb-8 flex flex-col space-y-3">
        <textarea
          rows={3}
          placeholder="Ask a question or leave a review for the author..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs uppercase rounded-full shadow transition-all cursor-pointer"
          >
            Post Comment
          </button>
        </div>
      </form>

      <div className="space-y-4">
        {comments.map((c) => (
          <div key={c.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex space-x-3">
            <img
              src={getOptimizedImageUrl(c.userAvatar, { width: 100, height: 100 })}
              alt={c.userName}
              loading="lazy"
              className="w-9 h-9 rounded-full object-cover border border-slate-200"
            />
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-xs text-slate-900">{c.userName}</span>
                <span className="text-[10px] text-slate-400">{new Date(c.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="text-xs text-slate-600 mt-1 font-light">{c.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
