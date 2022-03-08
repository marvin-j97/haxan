export function isBrowser(): boolean {
  return (
    typeof window !== "undefined" &&
    {}.toString.call(window) === "[object Window]"
  );
}

export function stringifyQuery(params: Record<string, unknown>): string {
  return Object.keys(params)
    .map((key) => key + "=" + String(params[key]))
    .join("&");
}

export function normalizeHeaders(headers: Headers): Record<string, string> {
  const normalized = {} as Record<string, string>;
  headers.forEach((v, k) => {
    normalized[k] = v;
  });
  return normalized;
}
