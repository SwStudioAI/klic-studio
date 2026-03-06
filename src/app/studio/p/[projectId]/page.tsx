"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useProject } from "@/hooks/useProjects";
import { useEpisodes, useCreateEpisode } from "@/hooks/useEpisodes";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createEpisodeSchema, type CreateEpisodeInput } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, ChevronLeft, Clapperboard, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import type { EpisodeStatus } from "@/lib/types";

const statusColor: Record<EpisodeStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  ready: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  rendering: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  done: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  failed: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = use(params);
  const { data: project, isLoading: projectLoading } = useProject(projectId);
  const { data: episodes, isLoading: episodesLoading } =
    useEpisodes(projectId);
  const createEpisode = useCreateEpisode(projectId);
  const [dialogOpen, setDialogOpen] = useState(false);

  const form = useForm<CreateEpisodeInput>({
    resolver: zodResolver(createEpisodeSchema),
    defaultValues: { title: "" },
  });

  const onSubmit = async (data: CreateEpisodeInput) => {
    try {
      await createEpisode.mutateAsync(data);
      toast.success("Episode created");
      form.reset();
      setDialogOpen(false);
    } catch {
      toast.error("Failed to create episode");
    }
  };

  const isLoading = projectLoading || episodesLoading;

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link
          href="/studio"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Projects
        </Link>

        {projectLoading ? (
          <Skeleton className="h-8 w-48" />
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">
                {project?.title ?? "Project"}
              </h1>
              {project?.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {project.description}
                </p>
              )}
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Episode
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Episode</DialogTitle>
                  <DialogDescription>
                    Add a new episode to this project.
                  </DialogDescription>
                </DialogHeader>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="ep-title">Title</Label>
                    <Input id="ep-title" {...form.register("title")} />
                    {form.formState.errors.title && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.title.message}
                      </p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={createEpisode.isPending}
                  >
                    {createEpisode.isPending ? "Creating..." : "Create"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      )}

      {!isLoading && episodes && episodes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Clapperboard className="h-12 w-12 mb-3 opacity-50" />
          <p className="font-medium">No episodes yet</p>
          <p className="text-sm">Create your first episode to start editing.</p>
        </div>
      )}

      {episodes && episodes.length > 0 && (
        <div className="space-y-3">
          {episodes.map((ep) => (
            <Link key={ep.id} href={`/studio/e/${ep.id}`}>
              <Card className="transition-shadow hover:shadow-md cursor-pointer">
                <CardHeader className="py-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{ep.title}</CardTitle>
                    <Badge
                      variant="secondary"
                      className={statusColor[ep.status]}
                    >
                      {ep.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 pb-4">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{ep.scenes?.length ?? 0} scenes</span>
                    <span>
                      Created {new Date(ep.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {!isLoading && !episodes && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <p className="text-sm">Failed to load episodes.</p>
        </div>
      )}
    </div>
  );
}
