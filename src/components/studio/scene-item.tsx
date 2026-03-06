"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { GripVertical, Trash2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Scene } from "@/lib/types";

interface SceneItemProps {
  scene: Scene;
  isActive: boolean;
  imageUrl?: string;
  onSelect: () => void;
  onDelete: () => void;
}

export function SceneItem({
  scene,
  isActive,
  imageUrl,
  onSelect,
  onDelete,
}: SceneItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: scene.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex items-center gap-2 rounded-md border p-2 transition-colors cursor-pointer",
        isActive
          ? "border-primary bg-accent"
          : "border-transparent hover:bg-accent/50",
        isDragging && "opacity-50"
      )}
      onClick={onSelect}
    >
      <button
        className="cursor-grab touch-none text-muted-foreground hover:text-foreground"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <div className="h-10 w-16 rounded bg-muted flex items-center justify-center shrink-0 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <ImageIcon className="h-4 w-4 text-muted-foreground" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate">
          {scene.script_text || "Empty scene"}
        </p>
        <p className="text-xs text-muted-foreground">{scene.duration_seconds}s</p>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 opacity-0 group-hover:opacity-100 shrink-0"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
      >
        <Trash2 className="h-3.5 w-3.5 text-destructive" />
      </Button>
    </div>
  );
}
