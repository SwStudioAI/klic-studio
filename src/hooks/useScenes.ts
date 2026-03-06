"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Scene, Episode, SceneCreatePayload, SceneUpdatePayload } from "@/lib/types";

export function useScenes(episodeId: string) {
  return useQuery<Scene[]>({
    queryKey: ["scenes", episodeId],
    queryFn: async () => {
      const ep = await api.get<Episode>(`/studio/episodes/${episodeId}`);
      return (ep.scenes ?? []).sort((a, b) => a.order - b.order);
    },
    enabled: !!episodeId,
  });
}

export function useCreateScene(episodeId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: SceneCreatePayload) =>
      api.post<Scene>(`/studio/episodes/${episodeId}/scenes`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["scenes", episodeId] });
      qc.invalidateQueries({ queryKey: ["episode", episodeId] });
    },
  });
}

export function useUpdateScene(episodeId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      sceneId,
      data,
    }: {
      sceneId: string;
      data: SceneUpdatePayload;
    }) => api.patch<Scene>(`/studio/scenes/${sceneId}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["scenes", episodeId] });
    },
  });
}

export function useDeleteScene(episodeId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (sceneId: string) => api.delete(`/studio/scenes/${sceneId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["scenes", episodeId] });
      qc.invalidateQueries({ queryKey: ["episode", episodeId] });
    },
  });
}

export function useReorderScenes(episodeId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (orderedIds: string[]) => {
      await Promise.all(
        orderedIds.map((id, index) =>
          api.patch(`/studio/scenes/${id}`, { order: index })
        )
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["scenes", episodeId] });
    },
  });
}
