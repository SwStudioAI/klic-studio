"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ProfileResponse } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Grid3X3, Heart, MessageCircle } from "lucide-react";
import Link from "next/link";

export default function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = use(params);

  const {
    data: profile,
    isLoading,
    error,
  } = useQuery<ProfileResponse>({
    queryKey: ["profile", username],
    queryFn: () => api.get<ProfileResponse>(`/profile/${username}`),
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <div className="inline-flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          <AlertCircle className="h-4 w-4" />
          <p className="text-sm">Profile not found.</p>
        </div>
      </div>
    );
  }

  const { user, stats, recent_posts } = profile;
  const displayName = user.display_name ?? user.username;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {user.banner_url && (
        <div className="relative -mx-4 mb-6 h-40 md:h-56 bg-muted overflow-hidden rounded-lg md:mx-0">
          <img
            src={user.banner_url}
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <div className="flex items-start gap-4 mb-8">
        <Avatar className="h-20 w-20">
          <AvatarImage src={user.avatar_url ?? undefined} />
          <AvatarFallback className="text-2xl">
            {displayName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">{displayName}</h1>
          <p className="text-muted-foreground text-sm">@{user.username}</p>
          {user.bio && (
            <p className="mt-2 text-sm max-w-md">{user.bio}</p>
          )}
          {user.website && (
            <a
              href={user.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline mt-1 inline-block"
            >
              {user.website}
            </a>
          )}
          <div className="mt-3 flex gap-4 text-sm text-muted-foreground">
            <span>
              <strong className="text-foreground">{stats.posts_count}</strong>{" "}
              posts
            </span>
            <span>
              <strong className="text-foreground">{stats.followers_count}</strong>{" "}
              followers
            </span>
            <span>
              <strong className="text-foreground">{stats.following_count}</strong>{" "}
              following
            </span>
          </div>
        </div>
      </div>

      {recent_posts.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Grid3X3 className="mx-auto h-12 w-12 mb-3 opacity-30" />
          <p className="font-medium">No posts yet</p>
        </div>
      ) : (
        <div className="grid gap-1 sm:grid-cols-3">
          {recent_posts.map((post) => (
            <Link
              key={post.id}
              href={`/p/${post.id}`}
              className="group relative aspect-square bg-muted overflow-hidden rounded-sm"
            >
              {post.thumbnail_url ? (
                <img
                  src={post.thumbnail_url}
                  alt=""
                  className="h-full w-full object-cover transition-opacity group-hover:opacity-80"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground text-xs">
                  Post
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity text-white text-sm">
                <span className="flex items-center gap-1">
                  <Heart className="h-4 w-4" />
                  {post.likes_count}
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="h-4 w-4" />
                  {post.comments_count}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
