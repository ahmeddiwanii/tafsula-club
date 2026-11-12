export async function fetchImageBytes(url: string): Promise<{ bytes: Uint8Array; kind: "png" | "jpg" } | null> {
  try {
    if (!/^https?:\/\//i.test(url)) return null
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
    if (!res.ok) return null
    const buf = new Uint8Array(await res.arrayBuffer())
    if (buf.length < 24 || buf.length > 8_000_000) return null
    if (buf[0] === 0x89 && buf[1] === 0x50) return { bytes: buf, kind: "png" }
    if (buf[0] === 0xff && buf[1] === 0xd8) return { bytes: buf, kind: "jpg" }
    const ct = res.headers.get("content-type") || ""
    if (ct.includes("png")) return { bytes: buf, kind: "png" }
    if (ct.includes("jpeg") || ct.includes("jpg")) return { bytes: buf, kind: "jpg" }
    return null
  } catch {
    return null
  }
}

export function toBase64(bytes: Uint8Array) {
  return Buffer.from(bytes).toString("base64")
}
