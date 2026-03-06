"use client";

import { use, useEffect, useState, useRef } from "react";
import { useRenderJob } from "@/hooks/useEpisodes";
import { subscribeToRenderEvents } from "@/lib/sse";
import { VideoPlayer } from "@/components/public/video-player";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronLeft,
  CheckCircle2,
  XCircle,
  Loader2,
  Clock,
  Ban,
} from "lucide-react";
import Link from "next/link";
import type { RenderJobStatus, RenderEvent } from "@/lib/types";

const statusConfig: Record<
  RenderJobStatus,
  { label: string; color: string; icon: React.ReactNode }
> = {
  queued: {
    label: "Queued",
    color: "bg-muted text-muted-foreground",
    icon: <Clock className="h-4 w-4" />,
  },
  running: {
    label: "Running",
    color:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    icon: <Loader2 className="h-4 w-4 animate-spin" />,
  },
  done: {
    label: "Done",
    color:
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    icon: <CheckCircle2 className="h-4 w-4" />,
  },
  failed: {
    label: "Failed",
    color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    icon: <XCircle className="h-4 w-4" />,
  },
  canceled: {
    label: "Canceled",
    color: "bg-muted text-muted-foreground",
    icon: <Ban className="h-4 w-4" />,
  },
};

export default function RenderJobPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = use(params);
  const { data: job, isLoading } = useRenderJob(jobId);
  const [logs, setLogs] = useState<string[]>([]);
  const [sseProgress, setSseProgress] = useState<number | null>(null);
  const [sseOutputUrl, setSseOutputUrl] = useState<string | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = subscribeToRenderEvents(
      jobId,
      (event: RenderEvent) => {
        switch (event.type) {
          case "progress":
            if (event.data.progress != null) {
              setSseProgress(event.data.progress);
            }
            break;
          case "log":
            if (event.data.message) {
              setLogs((prev) => [...prev, event.data.message!]);
            }
            break;
          case "done":
            if (event.data.output_url) {
              setSseOutputUrl(event.data.output_url);
            }
            setSseProgress(100);
            break;
          case "error":
            if (event.data.error) {
              setLogs((prev) => [...prev, `ERROR: ${event.data.error}`]);
            }
            break;
        }
      },
      () => {
        // SSE failed — polling fallback is active via useRenderJob
      }
    );

    return unsubscribe;
  }, [jobId]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const progress = sseProgress ?? job?.progress ?? 0;
  const outputUrl = sseOutputUrl ?? job?.output_url ?? null;
  const status = job?.status ?? "queued";
  const config = statusConfig[status];
  const isDone = status === "done" || sseOutputUrl != null;

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="aspect-video w-full max-w-2xl rounded-lg" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl">
      <Link
        href="/studio"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Studio
      </Link>

      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Render Job</h1>
          <Badge variant="secondary" className={config.color}>
            <span className="mr-1.5">{config.icon}</span>
            {config.label}
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>

        {job?.error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive text-sm">
            {job.error}
          </div>
        )}

        {isDone && outputUrl && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Output</h2>
            <VideoPlayer src={outputUrl} />
            <Button variant="outline" size="sm" asChild>
              <a
                href={outputUrl}
                download
                target="_blank"
                rel="noopener noreferrer"
              >
                Download Video
              </a>
            </Button>
          </div>
        )}

        {logs.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-sm font-semibold">Logs</h2>
            <ScrollArea className="h-48 rounded-md border bg-muted/50 p-3">
              <div className="space-y-1 font-mono text-xs">
                {logs.map((log, i) => (
                  <div
                    key={i}
                    className={
                      log.startsWith("ERROR")
                        ? "text-destructive"
                        : "text-muted-foreground"
                    }
                  >
                    {log}
                  </div>
                ))}
                <div ref={logsEndRef} />
              </div>
            </ScrollArea>
          </div>
        )}

        {job && (
          <div className="text-xs text-muted-foreground space-y-0.5">
            <p>Job ID: {job.job_id}</p>
            <p>Created: {new Date(job.created_at).toLocaleString()}</p>
            {job.started_at && (
              <p>Started: {new Date(job.started_at).toLocaleString()}</p>
            )}
            {job.finished_at && (
              <p>Finished: {new Date(job.finished_at).toLocaleString()}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
