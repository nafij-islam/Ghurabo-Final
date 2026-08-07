'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, Bookmark, ThumbsUp, MessageSquare, Trash2 } from 'lucide-react';
import { ITrip, IComment } from '@/types';
import { getOptimizedImageUrl } from '@/lib/utils/cloudinary';

interface Props {
  trip: ITrip;
  initialHelpfulCount: number;
}

export function AuthorActions({ trip, initialHelpfulCount }: Props) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [helpful, setHelpful] = useState(false);
  const [likesCount, setLikesCount] = useState(trip.likesCount || 0);
  const [savesCount, setSavesCount] = useState(trip.savesCount || 0);
  const [helpfulCount, setHelpfulCount] = useState(initialHelpfulCount || trip.helpfulVotesCount || 0);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const router = useRouter();

  const tripIdOrSlug = trip.id || (trip as any)._id || trip.slug;

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          setCurrentUser(data.user);
        }
      })
      .catch(() => {});

    fetch(`/api/trips/${tripIdOrSlug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          if (data.isLiked !== undefined) setLiked(data.isLiked);
          if (data.isSaved !== undefined) setSaved(data.isSaved);
          if (data.isHelpful !== undefined) setHelpful(data.isHelpful);
          if (data.trip) {
            setLikesCount(data.trip.likesCount || 0);
            setSavesCount(data.trip.savesCount || 0);
            setHelpfulCount(data.trip.helpfulVotesCount || initialHelpfulCount || 0);
          }
        }
      })
      .catch(() => {});
  }, [tripIdOrSlug]);

  const requireAuth = () => {
    if (!currentUser) {
      const currentUrl = typeof window !== 'undefined' ? window.location.pathname : `/trips/${trip.slug || trip.id}`;
      router.push(`/auth/login?redirect=${encodeURIComponent(currentUrl)}`);
      return false;
    }
    return true;
  };

  const handleLike = async () => {
    if (!requireAuth()) return;
    const newLiked = !liked;
    setLiked(newLiked);
    setLikesCount((prev) => (newLiked ? prev + 1 : Math.max(0, prev - 1)));

    try {
      await fetch(`/api/trips/${tripIdOrSlug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: newLiked ? 'like' : 'unlike' }),
      });
    } catch (err) {}
  };

  const handleSave = async () => {
    if (!requireAuth()) return;
    const newSaved = !saved;
    setSaved(newSaved);
    setSavesCount((prev) => (newSaved ? prev + 1 : Math.max(0, prev - 1)));

    try {
      await fetch(`/api/trips/${tripIdOrSlug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: newSaved ? 'save' : 'unsave' }),
      });
    } catch (err) {}
  };

  const handleHelpfulVote = async () => {
    if (!requireAuth()) return;
    const newHelpful = !helpful;
    setHelpful(newHelpful);
    setHelpfulCount((prev) => (newHelpful ? prev + 1 : Math.max(0, prev - 1)));

    try {
      await fetch(`/api/trips/${tripIdOrSlug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: newHelpful ? 'helpful' : 'unhelpful' }),
      });
    } catch (err) {}
  };

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <button
        type="button"
        onClick={handleLike}
        className={`flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
          liked ? 'bg-rose-500 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-rose-50 hover:text-rose-600'
        }`}
      >
        <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
        <span>{liked ? 'Liked' : 'Like'} ({likesCount})</span>
      </button>

      <button
        type="button"
        onClick={handleSave}
        className={`flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
          saved ? 'bg-amber-500 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-amber-50 hover:text-amber-600'
        }`}
      >
        <Bookmark className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
        <span>{saved ? 'Saved' : 'Save'} ({savesCount})</span>
      </button>

      <button
        type="button"
        onClick={handleHelpfulVote}
        className={`flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all shadow-md cursor-pointer ${
          helpful ? 'bg-emerald-600 text-white' : 'bg-brand-500 text-white hover:bg-brand-600'
        }`}
      >
        <ThumbsUp className={`w-4 h-4 ${helpful ? 'fill-current' : ''}`} />
        <span>Helpful ({helpfulCount})</span>
      </button>
    </div>
  );
}

export function CommentsSection({ tripId }: { tripId: string }) {
  const [comments, setComments] = useState<IComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          setCurrentUser(data.user);
        }
      })
      .catch(() => {});

    fetch(`/api/trips/${tripId}/comments`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.comments)) {
          setComments(data.comments);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [tripId]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    if (!currentUser) {
      const currentUrl = typeof window !== 'undefined' ? window.location.pathname : `/trips/${tripId}`;
      router.push(`/auth/login?redirect=${encodeURIComponent(currentUrl)}`);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/trips/${tripId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment.trim() }),
      });
      const data = await res.json();
      if (data.success && data.comment) {
        setComments([data.comment, ...comments]);
        setNewComment('');
      }
    } catch (err) {}
    setSubmitting(false);
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const res = await fetch(`/api/trips/${tripId}/comments?commentId=${commentId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
      }
    } catch (err) {}
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
          placeholder={currentUser ? 'Ask a question or leave a review for the author...' : 'Sign in to join the conversation...'}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs uppercase rounded-full shadow transition-all cursor-pointer"
          >
            {submitting ? 'Posting...' : 'Post Comment'}
          </button>
        </div>
      </form>

      {loading ? (
        <div className="py-6 text-center text-xs text-slate-400 font-semibold animate-pulse">
          Loading discussion comments...
        </div>
      ) : comments.length === 0 ? (
        <div className="py-6 text-center text-xs text-slate-400 font-light italic">
          No comments yet. Be the first to start the conversation!
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((c) => (
            <div key={c.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-start justify-between space-x-3">
              <div className="flex space-x-3">
                <img
                  src={getOptimizedImageUrl(c.userAvatar, { width: 100, height: 100 })}
                  alt={c.userName}
                  loading="lazy"
                  className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xs text-slate-900">{c.userName}</span>
                    <span className="text-[10px] text-slate-400">{new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 font-light">{c.content}</p>
                </div>
              </div>

              {currentUser && (currentUser.id === c.userId || currentUser.role === 'admin') && (
                <button
                  type="button"
                  onClick={() => handleDeleteComment(c.id)}
                  className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                  title="Delete comment"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
