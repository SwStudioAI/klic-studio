"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SceneItem } from "./scene-item";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Layers } from "lucide-react";
import type { Scene } from "@/lib/types";

interface ScenesListProps {
  scenes: Scene[];
  activeSceneId: string | null;
  assetUrls: Record<string, string>;
  onSelectScene: (id: string) => void;
  onReorder: (activeId: string, overId: string) => void;
  onDelete: (id: string) => void;
  onAddScene: () => void;
}

export function ScenesList({
  scenes,
  activeSceneId,
  assetUrls,
  onSelectScene,
  onReorder,
  onDelete,
  onAddScene,
}: ScenesListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      onReorder(String(active.id), String(over.id));
    }
  };

  return (
    <div className="flex h-full flex-col border-r">
      <div className="flex items-center justify-between border-b px-3 py-2">
        <h2 className="text-sm font-semibold flex items-center gap-1.5">
          <Layers className="h-4 w-4" />
          Scenes
        </h2>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onAddScene}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {scenes.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              <p>No scenes yet.</p>
              <Button
                variant="link"
                size="sm"
                className="mt-1 text-xs"
                onClick={onAddScene}
              >
                Add your first scene
              </Button>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={scenes.map((s) => s.id)}
                strategy={verticalListSortingStrategy}
              >
                {scenes.map((scene) => (
                  <SceneItem
                    key={scene.id}
                    scene={scene}
                    isActive={scene.id === activeSceneId}
                    imageUrl={
                      scene.image_asset_id
                        ? assetUrls[scene.image_asset_id]
                        : undefined
                    }
                    onSelect={() => onSelectScene(scene.id)}
                    onDelete={() => onDelete(scene.id)}
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
