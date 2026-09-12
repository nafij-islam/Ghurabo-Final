'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Bookmark, ThumbsUp, MessageSquare, Trash2, Edit3, Check, X } from 'lucide-react';
import { ITrip, IComment } from '@/types';
import { getOptimizedImageUrl } from '@/lib/utils/cloudinary';
import { useAuth } from '@/hooks/useAuth';
import { tripsApi, commentsApi } from '@/lib/api';
import { adaptBackendCommentToIComment } from '@/lib/api/adapters';

interface Props {
  trip: ITrip;
  initialHelpfulCount: number;
}

export function AuthorActions({ trip, initialHelpfulCount }: Props) {
  const [liked, setLiked] = useState(() => trip.isLiked ?? trip.viewerState?.hasLiked ?? false);
  const [saved, setSaved] = useState(() => trip.isSaved ?? trip.viewerState?.hasSaved ?? false);
  const [helpful, setHelpful] = useState(() => trip.isHelpful ?? trip.viewerState?.hasHelpful ?? false);
  const [likesCount, setLikesCount] = useState(trip.likesCount || 0);
  const [savesCount, setSavesCount] = useState(trip.savesCount || 0);
  const [helpfulCount, setHelpfulCount] = useState(initialHelpfulCount || trip.helpfulVotesCount || 0);
  const [submittingLike, setSubmittingLike] = useState(false);
  const [submittingSave, setSubmittingSave] = useState(false);
  const [submittingHelpful, setSubmittingHelpful] = useState(false);

  const { isAuthenticated } = useAuth();
  const router = useRouter();

  // Keep interaction state in sync when trip prop updates
  useEffect(() => {
    if (trip.viewerState) {
      setLiked(!!trip.viewerState.hasLiked);
      setSaved(!!trip.viewerState.hasSaved);
      setHelpful(!!trip.viewerState.hasHelpful);
    }
  }, [trip.viewerState]);

  const requireAuth = () => {
    if (!isAuthenticated) {
      const currentUrl = typeof window !== 'undefined' ? window.location.pathname : `/trips/${trip.slug || trip.id}`;
      router.push(`/auth/login?redirect=${encodeURIComponent(currentUrl)}`);
      return false;
    }
    return true;
  };

  const handleLike = async () => {
    if (!requireAuth() || submittingLike) return;
    setSubmittingLike(true);

    const prevLiked = liked;
    const prevCount = likesCount;
    const nextLiked = !prevLiked;
    const nextCount = nextLiked ? prevCount + 1 : Math.max(0, prevCount - 1);

    setLiked(nextLiked);
    setLikesCount(nextCount);

    try {
      const res = await tripsApi.toggleLike(trip.id);
      setLiked(res.active);
      setLikesCount(res.count);
    } catch {
      setLiked(prevLiked);
      setLikesCount(prevCount);
    } finally {
      setSubmittingLike(false);
    }
  };

  const handleSave = async () => {
    if (!requireAuth() || submittingSave) return;
    setSubmittingSave(true);

    const prevSaved = saved;
    const prevCount = savesCount;
    const nextSaved = !prevSaved;
    const nextCount = nextSaved ? prevCount + 1 : Math.max(0, prevCount - 1);

    setSaved(nextSaved);
    setSavesCount(nextCount);

    try {
      const res = await tripsApi.toggleSave(trip.id);
      setSaved(res.active);
      setSavesCount(res.count);
    } catch {
      setSaved(prevSaved);
      setSavesCount(prevCount);
    } finally {
      setSubmittingSave(false);
    }
  };

  const handleHelpfulVote = async () => {
    if (!requireAuth() || submittingHelpful) return;
    setSubmittingHelpful(true);

    const prevHelpful = helpful;
    const prevCount = helpfulCount;
    const nextHelpful = !prevHelpful;
    const nextCount = nextHelpful ? prevCount + 1 : Math.max(0, prevCount - 1);

    setHelpful(nextHelpful);
    setHelpfulCount(nextCount);

    try {
      const res = await tripsApi.toggleHelpful(trip.id);
      setHelpful(res.active);
      setHelpfulCount(res.count);
    } catch {
      setHelpful(prevHelpful);
      setHelpfulCount(prevCount);
    } finally {
      setSubmittingHelpful(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
      <button
        type="button"
        disabled={submittingLike}
        onClick={handleLike}
        className={`flex items-center space-x-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-bold transition-all cursor-pointer disabled:opacity-60 ${
          liked ? 'bg-rose-500 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-rose-50 hover:text-rose-600'
        }`}
      >
        <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${liked ? 'fill-current' : ''}`} />
        <span>{liked ? 'Liked' : 'Like'} ({likesCount})</span>
      </button>

      <button
        type="button"
        disabled={submittingSave}
        onClick={handleSave}
        className={`flex items-center space-x-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-bold transition-all cursor-pointer disabled:opacity-60 ${
          saved ? 'bg-amber-500 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-amber-50 hover:text-amber-600'
        }`}
      >
        <Bookmark className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${saved ? 'fill-current' : ''}`} />
        <span>{saved ? 'Saved' : 'Save'} ({savesCount})</span>
      </button>

      <button
        type="button"
        disabled={submittingHelpful}
        onClick={handleHelpfulVote}
        className={`flex items-center space-x-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-60 ${
          helpful ? 'bg-emerald-600 text-white' : 'bg-brand-500 text-white hover:bg-brand-600'
        }`}
      >
        <ThumbsUp className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${helpful ? 'fill-current' : ''}`} />
        <span>Helpful ({helpfulCount})</span>
      </button>
    </div>
  );
}

export function CommentsSection({
  tripId,
  onCommentCountChange,
}: {
  tripId: string;
  onCommentCountChange?: (count: number) => void;
}) {
  const [comments, setComments] = useState<IComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!tripId) return;
    let mounted = true;
    setLoading(true);

    commentsApi
      .getTripComments(tripId)
      .then((res) => {
        if (mounted && res?.data) {
          const adapted = res.data.map(adaptBackendCommentToIComment);
          setComments(adapted);
          if (onCommentCountChange) {
            onCommentCountChange(adapted.length);
          }
        }
      })
      .catch((err) => console.error('Failed to load comments:', err))
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [tripId, onCommentCountChange]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    if (!isAuthenticated) {
      const currentUrl = typeof window !== 'undefined' ? window.location.pathname : `/trips/${tripId}`;
      router.push(`/auth/login?redirect=${encodeURIComponent(currentUrl)}`);
      return;
    }

    setSubmitting(true);
    try {
      const created = await commentsApi.createComment(tripId, newComment.trim());
      const adapted = adaptBackendCommentToIComment(created);
      setComments((prev) => {
        const next = [adapted, ...prev];
        if (onCommentCountChange) onCommentCountChange(next.length);
        return next;
      });
      setNewComment('');
    } catch (err) {
      console.error('Failed to post comment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartEdit = (comment: IComment) => {
    setEditingId(comment.id || comment._id || '');
    setEditContent(comment.content);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditContent('');
  };

  const handleSaveEdit = async (commentId: string) => {
    if (!editContent.trim()) return;
    setSavingEdit(true);
    try {
      const updated = await commentsApi.updateComment(commentId, editContent.trim());
      const adapted = adaptBackendCommentToIComment(updated);
      setComments((prev) =>
        prev.map((c) => (c.id === commentId || c._id === commentId ? adapted : c))
      );
      setEditingId(null);
      setEditContent('');
    } catch (err) {
      console.error('Failed to edit comment:', err);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    try {
      await commentsApi.deleteComment(commentId);
      setComments((prev) => {
        const next = prev.filter((c) => c.id !== commentId && c._id !== commentId);
        if (onCommentCountChange) onCommentCountChange(next.length);
        return next;
      });
    } catch (err) {
      console.error('Failed to delete comment:', err);
    }
  };

  return (
    <div className="bg-white p-5 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100 mb-8 sm:mb-12">
      <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 uppercase mb-5 sm:mb-6 flex items-center space-x-2">
        <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-brand-500 shrink-0" />
        <span>Community Discussion ({comments.length})</span>
      </h2>

      <form onSubmit={handleAddComment} className="mb-8 flex flex-col space-y-3">
        <textarea
          rows={3}
          placeholder={user ? 'Ask a question or leave a review for the author...' : 'Sign in to join the conversation...'}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs uppercase rounded-full shadow transition-all cursor-pointer disabled:opacity-60"
          >
            {submitting ? 'Posting...' : 'Post Comment'}
          </button>
        </div>
      </form>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-start space-x-3">
              <div className="w-9 h-9 rounded-full bg-slate-200 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-28 bg-slate-200 rounded" />
                <div className="h-3 w-3/4 bg-slate-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="py-12 text-center text-xs text-slate-400 font-light italic bg-slate-50 rounded-2xl border border-slate-100">
          No comments yet. Be the first to start the conversation!
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((c) => {
            const commentId = c.id || c._id || '';
            const isOwner = user && (user.id === c.userId || (user as any)._id === c.userId);
            const isAdmin = user?.role === 'admin';
            const isEditing = editingId === commentId;
            const authorSlug = c.authorUsername || c.userName;

            return (
              <div key={commentId} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-start justify-between space-x-3">
                <div className="flex space-x-3 flex-1">
                  <Link href={`/profile/${authorSlug}`}>
                    <Image
                      src={getOptimizedImageUrl(c.userAvatar, { width: 100, height: 100 })}
                      alt={c.userName || 'Commenter avatar'}
                      width={36}
                      height={36}
                      className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0 hover:opacity-80 transition-opacity"
                    />
                  </Link>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <Link
                        href={`/profile/${authorSlug}`}
                        className="font-bold text-xs text-slate-900 hover:text-brand-600 transition-colors"
                      >
                        {c.userName}
                      </Link>
                      <span className="text-[10px] text-slate-400">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {isEditing ? (
                      <div className="space-y-2 mt-2">
                        <textarea
                          rows={2}
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            disabled={savingEdit}
                            onClick={() => handleSaveEdit(commentId)}
                            className="px-3 py-1 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-xs font-semibold flex items-center space-x-1"
                          >
                            <Check className="w-3 h-3" />
                            <span>Save</span>
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-semibold flex items-center space-x-1"
                          >
                            <X className="w-3 h-3" />
                            <span>Cancel</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-600 mt-1 font-light leading-relaxed whitespace-pre-line">
                        {c.content}
                      </p>
                    )}
                  </div>
                </div>

                {!isEditing && (
                  <div className="flex items-center space-x-1 shrink-0">
                    {isOwner && (
                      <button
                        type="button"
                        onClick={() => handleStartEdit(c)}
                        className="p-1.5 text-slate-400 hover:text-brand-600 transition-colors"
                        title="Edit comment"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    )}
                    {(isOwner || isAdmin) && (
                      <button
                        type="button"
                        onClick={() => handleDeleteComment(commentId)}
                        className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                        title="Delete comment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
