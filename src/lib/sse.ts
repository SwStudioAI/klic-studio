import { getToken } from "./auth";
import type { RenderEvent } from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export function subscribeToRenderEvents(
  jobId: string,
  onEvent: (event: RenderEvent) => void,
  onError?: (error: Event) => void
): () => void {
  const token = getToken();
  const url = `${BASE_URL}/studio/render-jobs/${jobId}/events${
    token ? `?token=${encodeURIComponent(token)}` : ""
  }`;

  const source = new EventSource(url);

  source.onmessage = (e) => {
    try {
      const event: RenderEvent = JSON.parse(e.data);
      onEvent(event);
    } catch {
      // ignore malformed events
    }
  };

  source.onerror = (e) => {
    onError?.(e);
    source.close();
  };

  return () => source.close();
}
