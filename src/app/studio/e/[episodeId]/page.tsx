"use client";

import { use, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { arrayMove } from "@dnd-kit/sortable";
import {
  useEpisode,
  useRenderEpisode,
  usePublishEpisode,
} from "@/hooks/useEpisodes";
import {
  useScenes,
  useCreateScene,
  useUpdateScene,
  useDeleteScene,
  useReorderScenes,
} from "@/hooks/useScenes";
import { ScenesList } from "@/components/studio/scenes-list";
import { ScenePreview } from "@/components/studio/scene-preview";
import { PropertiesPanel } from "@/components/studio/properties-panel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  Play,
  Globe,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import type { Scene, SceneUpdatePayload, EpisodeStatus } from "@/lib/types";

const statusColor: Record<EpisodeStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  ready: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  rendering:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  done: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  failed: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

export default function EpisodeEditorPage({
  params,
}: {
  params: Promise<{ episodeId: string }>;
}) {
  const { episodeId } = use(params);
  const router = useRouter();

  const { data: episode, isLoading: epLoading } = useEpisode(episodeId);
  const { data: scenes, isLoading: scenesLoading } = useScenes(episodeId);
  const createScene = useCreateScene(episodeId);
  const updateScene = useUpdateScene(episodeId);
  const deleteScene = useDeleteScene(episodeId);
  const reorderScenes = useReorderScenes(episodeId);
  const renderEpisode = useRenderEpisode(episodeId);
  const publishEpisode = usePublishEpisode(episodeId);

  const [activeSceneId, setActiveSceneId] = useState<string | null>(null);
  const [localScenes, setLocalScenes] = useState<Scene[] | null>(null);
  const [assetUrls, setAssetUrls] = useState<Record<string, string>>({});

  const displayScenes = localScenes ?? scenes ?? [];
  const activeScene =
    displayScenes.find((s) => s.id === activeSceneId) ?? null;

  const handleAssetUploaded = useCallback(
    (assetId: string, url: string) => {
      setAssetUrls((prev) => ({ ...prev, [assetId]: url }));
    },
    []
  );

  const handleAddScene = useCallback(async () => {
    try {
      const newScene = await createScene.mutateAsync({
        script_text: "New scene",
        duration_seconds: 5,
        order: displayScenes.length,
      });
      setActiveSceneId(newScene.id);
      toast.success("Scene added");
    } catch {
      toast.error("Failed to add scene");
    }
  }, [createScene, displayScenes.length]);

  const handleReorder = useCallback(
    (activeId: string, overId: string) => {
      const current = localScenes ?? scenes ?? [];
      const oldIndex = current.findIndex((s) => s.id === activeId);
      const newIndex = current.findIndex((s) => s.id === overId);
      if (oldIndex === -1 || newIndex === -1) return;

      const reordered = arrayMove(current, oldIndex, newIndex);
      setLocalScenes(reordered);
      reorderScenes.mutate(reordered.map((s) => s.id), {
        onSettled: () => setLocalScenes(null),
      });
    },
    [localScenes, scenes, reorderScenes]
  );

  const handleDeleteScene = useCallback(
    async (sceneId: string) => {
      if (activeSceneId === sceneId) setActiveSceneId(null);
      try {
        await deleteScene.mutateAsync(sceneId);
        toast.success("Scene deleted");
      } catch {
        toast.error("Failed to delete scene");
      }
    },
    [activeSceneId, deleteScene]
  );

  const handleSaveScene = useCallback(
    async (sceneId: string, data: SceneUpdatePayload) => {
      await updateScene.mutateAsync({ sceneId, data });
    },
    [updateScene]
  );

  const handleRender = async () => {
    try {
      const result = await renderEpisode.mutateAsync();
      toast.success("Render started");
      router.push(`/studio/r/${result.job_id}`);
    } catch {
      toast.error("Failed to start render");
    }
  };

  const handlePublish = async () => {
    try {
      const result = await publishEpisode.mutateAsync();
      toast.success("Published!");
      if (result.post_id) {
        router.push(`/p/${result.post_id}`);
      }
    } catch {
      toast.error("Failed to publish");
    }
  };

  if (epLoading || scenesLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!episode) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="inline-flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          <AlertCircle className="h-4 w-4" />
          <p className="text-sm">Episode not found.</p>
        </div>
      </div>
    );
  }

  const canPublish = episode.status === "done";

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between border-b px-4 py-2">
        <div className="flex items-center gap-3">
          <Link
            href={`/studio/p/${episode.project_id}`}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-sm font-semibold">{episode.title}</h1>
          </div>
          <Badge variant="secondary" className={statusColor[episode.status]}>
            {episode.status}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleRender}
            disabled={
              renderEpisode.isPending ||
              displayScenes.length === 0 ||
              episode.status === "rendering"
            }
          >
            {renderEpisode.isPending ? (
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Play className="mr-2 h-3.5 w-3.5" />
            )}
            Render
          </Button>
          <Button
            size="sm"
            onClick={handlePublish}
            disabled={!canPublish || publishEpisode.isPending}
          >
            {publishEpisode.isPending ? (
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Globe className="mr-2 h-3.5 w-3.5" />
            )}
            Publish
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-60 shrink-0">
          <ScenesList
            scenes={displayScenes}
            activeSceneId={activeSceneId}
            assetUrls={assetUrls}
            onSelectScene={setActiveSceneId}
            onReorder={handleReorder}
            onDelete={handleDeleteScene}
            onAddScene={handleAddScene}
          />
        </div>

        <div className="flex-1 bg-muted/30">
          <ScenePreview
            scene={activeScene}
            imageUrl={
              activeScene?.image_asset_id
                ? assetUrls[activeScene.image_asset_id]
                : undefined
            }
          />
        </div>

        <PropertiesPanel
          scene={activeScene}
          onSave={handleSaveScene}
          onAssetUploaded={handleAssetUploaded}
        />
      </div>
    </div>
  );
}
