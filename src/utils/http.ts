export type JsonValue =
  | null
  | boolean
  | number
  | string
  | JsonValue[]
  | { [key: string]: JsonValue };

export async function fetchJson<T extends JsonValue>(
  url: string,
  init: RequestInit,
  errorPrefix: string
): Promise<T> {
  const response = await fetch(url, init);
  if (!response.ok) {
    const body = await safeReadText(response);
    throw new Error(
      `${errorPrefix} (${response.status} ${response.statusText})${body ? `: ${body}` : ''}`
    );
  }
  return (await response.json()) as T;
}

async function safeReadText(response: Response): Promise<string> {
  try {
    return await response.text();
  } catch {
    return '';
  }
}
