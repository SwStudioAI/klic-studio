"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ProjectListItem, ProjectResponse } from "@/lib/types";
import type { CreateProjectInput } from "@/lib/schemas";

export function useProjects() {
  return useQuery<ProjectListItem[]>({
    queryKey: ["projects"],
    queryFn: () => api.get<ProjectListItem[]>("/studio/projects"),
  });
}

export function useProject(projectId: string) {
  return useQuery<ProjectResponse>({
    queryKey: ["projects", projectId],
    queryFn: () => api.get<ProjectResponse>(`/studio/projects/${projectId}`),
    enabled: !!projectId,
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProjectInput) =>
      api.post<ProjectListItem>("/studio/projects", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}
