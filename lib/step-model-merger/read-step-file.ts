/**
 * Fetches STEP file content from an HTTP(S) URL.
 * For local files, the caller must read the file and pass the content directly.
 */
export async function readStepFile(modelUrl: string): Promise<string> {
  if (!/^https?:\/\//i.test(modelUrl)) {
    throw new Error(
      `Only HTTP(S) URLs are supported. For local files, read the file content and pass it directly. Received: ${modelUrl}`,
    )
  }

  const globalFetch = (globalThis as any).fetch as
    | ((input: string, init?: unknown) => Promise<any>)
    | undefined
  if (!globalFetch) {
    throw new Error("fetch is not available in this environment")
  }

  let res: Response
  try {
    res = await globalFetch(modelUrl)
  } catch (err) {
    // Network errors (including CORS) throw TypeError with often empty messages
    // Provide more context to help debug
    const message =
      err instanceof Error && err.message ? err.message : "unknown error"
    throw new Error(
      `Network error fetching STEP file (this may be a CORS issue - ensure the server allows cross-origin requests): ${message}`,
    )
  }

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText}`)
  }
  return await res.text()
}
