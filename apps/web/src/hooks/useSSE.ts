import { useCallback } from "react";

export function useSSE() {
  const connect = useCallback(
    (url: string, body: Record<string, unknown>, onMessage: (data: unknown) => void) => {
      return new Promise<void>((resolve, reject) => {
        const es = new EventSource(`${url}?payload=${encodeURIComponent(JSON.stringify(body))}`);
        es.onmessage = (event) => {
          if (event.data === "[DONE]") {
            es.close();
            resolve();
            return;
          }
          try {
            const data = JSON.parse(event.data);
            onMessage(data);
          } catch {
            onMessage({ type: "text", content: event.data });
          }
        };
        es.onerror = () => {
          es.close();
          reject(new Error("SSE connection failed"));
        };
      });
    },
    []
  );

  return { connect };
}
