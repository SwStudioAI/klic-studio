"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("ROOT ERROR BOUNDARY:", error);
  }, [error]);

  return (
    <div style={{ padding: 40, fontFamily: "system-ui" }}>
      <h2 style={{ color: "red" }}>Something went wrong!</h2>
      <pre style={{ whiteSpace: "pre-wrap", background: "#f5f5f5", padding: 16, borderRadius: 8 }}>
        {error.message}
      </pre>
      <pre style={{ whiteSpace: "pre-wrap", background: "#f5f5f5", padding: 16, borderRadius: 8, fontSize: 12 }}>
        {error.stack}
      </pre>
      <button
        onClick={reset}
        style={{ marginTop: 16, padding: "8px 16px", cursor: "pointer" }}
      >
        Try again
      </button>
    </div>
  );
}
