"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  Episode,
  ProjectResponse,
  PublishResponse,
  RenderJob,
} from "@/lib/types";
import type { CreateEpisodeInput } from "@/lib/schemas";

export function useEpisodes(projectId: string) {
  return useQuery<Episode[]>({
    queryKey: ["episodes", projectId],
    queryFn: async () => {
      const project = await api.get<ProjectResponse>(
        `/studio/projects/${projectId}`
      );
      return project.episodes ?? [];
    },
    enabled: !!projectId,
  });
}

export function useEpisode(episodeId: string) {
  return useQuery<Episode>({
    queryKey: ["episode", episodeId],
    queryFn: () => api.get<Episode>(`/studio/episodes/${episodeId}`),
    enabled: !!episodeId,
  });
}

export function useCreateEpisode(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEpisodeInput) =>
      api.post<Episode>(`/studio/projects/${projectId}/episodes`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["episodes", projectId] });
      qc.invalidateQueries({ queryKey: ["projects", projectId] });
    },
  });
}

export function useRenderEpisode(episodeId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      api.post<{ job_id: string }>(
        `/studio/episodes/${episodeId}/render`
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["episode", episodeId] });
    },
  });
}

export function usePublishEpisode(episodeId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      api.post<PublishResponse>(`/studio/episodes/${episodeId}/publish`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["episode", episodeId] });
    },
  });
}

export function useRenderJob(jobId: string) {
  return useQuery<RenderJob>({
    queryKey: ["render-job", jobId],
    queryFn: () => api.get<RenderJob>(`/studio/render-jobs/${jobId}`),
    enabled: !!jobId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === "done" || status === "failed" || status === "canceled")
        return false;
      return 3000;
    },
  });
}
