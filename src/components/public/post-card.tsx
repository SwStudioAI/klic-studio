import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Eye, Heart, MessageCircle } from "lucide-react";
import type { Post } from "@/lib/types";

export function PostCard({ post }: { post: Post }) {
  const thumbnail =
    post.media.find((m) => m.thumb_url)?.thumb_url ??
    post.media.find((m) => m.type === "image")?.url ??
    null;

  return (
    <Link href={`/p/${post.id}`}>
      <Card className="group overflow-hidden transition-shadow hover:shadow-lg">
        <div className="relative aspect-video bg-muted">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={post.text}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
              No thumbnail
            </div>
          )}
        </div>
        <CardContent className="p-3">
          <h3 className="font-medium text-sm line-clamp-2 mb-2">
            {post.text}
          </h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={post.user.avatar_url ?? undefined} />
                <AvatarFallback className="text-xs">
                  {post.user.display_name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">
                {post.user.display_name}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
