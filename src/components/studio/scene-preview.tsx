"use client";

import type { Scene } from "@/lib/types";
import { Image as ImageIcon } from "lucide-react";

interface ScenePreviewProps {
  scene: Scene | null;
  imageUrl?: string;
}

export function ScenePreview({ scene, imageUrl }: ScenePreviewProps) {
  if (!scene) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        <p className="text-sm">Select a scene to preview</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="relative w-full max-w-lg aspect-video rounded-lg bg-muted overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="Scene"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <ImageIcon className="h-12 w-12 text-muted-foreground/30" />
            </div>
          )}
          {scene.script_text && (
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4">
              <p className="text-white text-sm leading-relaxed line-clamp-3">
                {scene.script_text}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="border-t px-4 py-2">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>Duration: {scene.duration_seconds}s</span>
          <span>Order: {scene.order + 1}</span>
          {scene.audio_asset_id && <span>Audio attached</span>}
        </div>
      </div>
    </div>
  );
}
