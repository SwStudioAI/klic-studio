"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { FeedResponse } from "@/lib/types";
import { PostCard } from "@/components/public/post-card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";

export default function ExplorePage() {
  const { data, isLoading, error } = useQuery<FeedResponse>({
    queryKey: ["feed"],
    queryFn: () => api.get<FeedResponse>("/feed"),
  });

  const posts = data?.items ?? [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Explore</h1>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive mb-6">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <p className="text-sm">Failed to load posts. Please try again later.</p>
        </div>
      )}

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-video w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && posts.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <p className="text-lg font-medium">No posts yet</p>
          <p className="text-sm">Be the first to create and publish a video!</p>
        </div>
      )}

      {posts.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
