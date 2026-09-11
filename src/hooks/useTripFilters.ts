'use client';

import { useState, useMemo } from 'react';
import { ITrip, TravelType } from '@/types';

export type TripSortOption =
  | 'newest'
  | 'recent'
  | 'popular'
  | 'lowest_cost'
  | 'cost-low'
  | 'highest_rating'
  | 'cost-high';

export interface TripFilterOptions {
  travelType?: TravelType | 'All';
  searchQuery?: string;
  maxBudget?: number;
  sortBy?: TripSortOption;
}

export function useTripFilters(initialTrips: ITrip[]) {
  const [travelType, setTravelType] = useState<TravelType | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [maxBudget, setMaxBudget] = useState<number>(100000);
  const [sortBy, setSortBy] = useState<TripSortOption>('newest');

  const filteredTrips = useMemo(() => {
    let result = [...initialTrips];

    // Filter by travel type
    if (travelType && travelType !== 'All') {
      result = result.filter((t) => t.travelType === travelType);
    }

    // Filter by search query (title, destination, summary)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.destinationName.toLowerCase().includes(q) ||
          t.summary.toLowerCase().includes(q)
      );
    }

    // Filter by max budget per person
    if (maxBudget > 0) {
      result = result.filter(
        (t) => (t.costBreakdown?.perPersonCost || t.costBreakdown?.totalCost || 0) <= maxBudget
      );
    }

    // Sort
    if (sortBy === 'popular') {
      result.sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0));
    } else if (sortBy === 'lowest_cost' || sortBy === 'cost-low') {
      result.sort(
        (a, b) =>
          (a.costBreakdown?.perPersonCost || 0) - (b.costBreakdown?.perPersonCost || 0)
      );
    } else if (sortBy === 'cost-high') {
      result.sort(
        (a, b) =>
          (b.costBreakdown?.perPersonCost || 0) - (a.costBreakdown?.perPersonCost || 0)
      );
    } else if (sortBy === 'highest_rating') {
      result.sort(
        (a, b) => (b.helpfulVotesCount || 0) - (a.helpfulVotesCount || 0)
      );
    } else {
      // 'newest' / 'recent'
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }, [initialTrips, travelType, searchQuery, maxBudget, sortBy]);

  return {
    travelType,
    setTravelType,
    searchQuery,
    setSearchQuery,
    maxBudget,
    setMaxBudget,
    sortBy,
    setSortBy,
    filteredTrips,
    totalCount: filteredTrips.length,
  };
}
