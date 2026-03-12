// services/intelligence/src/lib/http.ts
// Simple fetch wrapper with timeout/abort — no external deps beyond Node fetch

export async function fetchText(url: string, timeoutMs = 10000): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'xhaka-tool-monitor/1.0',
        'Accept': 'text/html,application/xml,application/atom+xml,text/plain',
      },
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}
