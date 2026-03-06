"use client";

interface VideoPlayerProps {
  src: string | null;
  poster?: string | null;
}

export function VideoPlayer({ src, poster }: VideoPlayerProps) {
  if (!src) {
    return (
      <div className="aspect-video bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
        Video not available
      </div>
    );
  }

  return (
    <video
      controls
      className="w-full aspect-video rounded-lg bg-black"
      poster={poster ?? undefined}
      preload="metadata"
    >
      <source src={src} />
      Your browser does not support video playback.
    </video>
  );
}
