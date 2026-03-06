"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { isAuthenticated } from "@/lib/auth";
import type { User } from "@/lib/types";

export function useMe() {
  return useQuery<User>({
    queryKey: ["me"],
    queryFn: () => api.get<User>("/users/me"),
    enabled: isAuthenticated(),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}
