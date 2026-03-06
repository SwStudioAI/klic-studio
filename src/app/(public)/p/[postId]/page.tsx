"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Post } from "@/lib/types";
import { VideoPlayer } from "@/components/public/video-player";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function PostDetailPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = use(params);

  const { data: post, isLoading, error } = useQuery<Post>({
    queryKey: ["post", postId],
    queryFn: () => api.get<Post>(`/posts/${postId}`),
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 space-y-4">
        <Skeleton className="aspect-video w-full rounded-lg" />
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <div className="inline-flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          <AlertCircle className="h-4 w-4" />
          <p className="text-sm">Post not found or failed to load.</p>
        </div>
      </div>
    );
  }

  const videoMedia = post.media.find((m) => m.type === "video");
  const videoSrc = videoMedia?.url ?? null;
  const posterSrc = videoMedia?.thumb_url ?? post.media[0]?.thumb_url ?? null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <VideoPlayer src={videoSrc} poster={posterSrc} />

      <div className="mt-4 space-y-3">
        <p className="text-base leading-relaxed">{post.text}</p>

        <div className="flex items-center justify-between flex-wrap gap-3">
          <Link
            href={`/u/${post.user.username}`}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={post.user.avatar_url ?? undefined} />
              <AvatarFallback>
                {post.user.display_name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium text-sm">
              {post.user.display_name}
            </span>
          </Link>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date(post.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {post.media.length > 0 && !videoMedia && (
        <div className="mt-6 grid gap-2 grid-cols-2">
          {post.media.map((m) => (
            <img
              key={m.id}
              src={m.url}
              alt=""
              className="rounded-lg object-cover aspect-square w-full"
            />
          ))}
        </div>
      )}
    </div>
  );
}
