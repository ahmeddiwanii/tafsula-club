import { PDFDocument, rgb, StandardFonts, type PDFFont, type PDFImage, type PDFPage } from "pdf-lib"
import { fetchImageBytes } from "./media"
import { getTheme, rgb01 } from "./theme"
import type { StoryDeck, StorySlide } from "./types"

const W = 960
const H = 540

function color(c: [number, number, number]) {
  const x = rgb01(c)
  return rgb(x.r, x.g, x.b)
}

function txt(value: string | undefined) {
  return String(value || "").replace(/[^\x09\x0A\x0D\x20-\xFF]/g, " ").replace(/\s+/g, " ").trim()
}

function wrap(font: PDFFont, text: string, size: number, maxWidth: number) {
  const words = txt(text).split(/\s+/).filter(Boolean)
  const lines: string[] = []
  let line = ""
  for (const word of words) {
    const next = line ? `${line} ${word}` : word
    if (font.widthOfTextAtSize(next, size) <= maxWidth) line = next
    else {
      if (line) lines.push(line)
      line = word
    }
  }
  if (line) lines.push(line)
  return lines.slice(0, 14)
}

function paintBg(page: PDFPage, theme: StoryDeck["theme"]) {
  const t = getTheme(theme)
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: color(t.bg) })
  page.drawRectangle({ x: 0, y: 0, width: 10, height: H, color: color(t.accent) })
  page.drawRectangle({ x: 0, y: H - 6, width: W, height: 6, color: color(t.bg2) })
}

async function embedUrl(pdf: PDFDocument, cache: Map<string, PDFImage>, url?: string) {
  if (!url) return null
  if (cache.has(url)) return cache.get(url)!
  const img = await fetchImageBytes(url)
  if (!img) return null
  const embedded = img.kind === "png" ? await pdf.embedPng(img.bytes) : await pdf.embedJpg(img.bytes)
  cache.set(url, embedded)
  return embedded
}

function drawKicker(page: PDFPage, font: PDFFont, text: string, theme: StoryDeck["theme"], x = 48, y = 478) {
  page.drawText(txt(text).toUpperCase(), {
    x,
    y,
    size: 9,
    font,
    color: color(getTheme(theme).accent),
  })
}

function footer(page: PDFPage, deck: StoryDeck, font: PDFFont, index: number, total: number) {
  const t = getTheme(deck.theme)
  page.drawText(txt(`${deck.organizationName}  ·  ${deck.periodLabel}`), {
    x: 48,
    y: 22,
    size: 8,
    font,
    color: color(t.muted),
  })
  page.drawText(`${index + 1} / ${total}`, {
    x: W - 80,
    y: 22,
    size: 8,
    font,
    color: color(t.muted),
  })
}

function drawMetrics(
  page: PDFPage,
  slide: StorySlide,
  fonts: { regular: PDFFont; bold: PDFFont },
  theme: StoryDeck["theme"],
  y = 210,
) {
  const metrics = slide.metrics?.slice(0, 4) || []
  if (!metrics.length) return
  const t = getTheme(theme)
  const boxW = (W - 96 - (metrics.length - 1) * 14) / metrics.length
  metrics.forEach((m, i) => {
    const x = 48 + i * (boxW + 14)
    page.drawRectangle({ x, y, width: boxW, height: 92, color: color(t.card) })
    page.drawRectangle({ x, y: y + 90, width: boxW, height: 2, color: color(t.accent) })
    page.drawText(txt(m.value).slice(0, 12), { x: x + 16, y: y + 44, size: 26, font: fonts.bold, color: color(t.ink) })
    page.drawText(txt(m.label).slice(0, 22), { x: x + 16, y: y + 22, size: 9, font: fonts.regular, color: color(t.muted) })
  })
}

async function drawSlide(
  pdf: PDFDocument,
  page: PDFPage,
  deck: StoryDeck,
  slide: StorySlide,
  fonts: { regular: PDFFont; bold: PDFFont },
  cache: Map<string, PDFImage>,
  index: number,
) {
  const t = getTheme(deck.theme)
  paintBg(page, deck.theme)
  footer(page, deck, fonts.regular, index, deck.slides.length)

  if (slide.layout === "cover") {
    const img = await embedUrl(pdf, cache, slide.imageUrl || deck.coverUrl || undefined)
    if (img) {
      page.drawImage(img, { x: W * 0.48, y: 56, width: W * 0.46, height: H - 90, opacity: 0.92 })
      page.drawRectangle({ x: W * 0.48, y: 56, width: 18, height: H - 90, color: color(t.accent) })
    }
    if (slide.kicker) drawKicker(page, fonts.bold, slide.kicker, deck.theme)
    wrap(fonts.bold, slide.title, 36, 400).forEach((line, i) => {
      page.drawText(line, { x: 48, y: 400 - i * 42, size: 36, font: fonts.bold, color: color(t.ink) })
    })
    if (slide.body) {
      wrap(fonts.regular, slide.body, 13, 400).forEach((line, i) => {
        page.drawText(line, { x: 48, y: 280 - i * 18, size: 13, font: fonts.regular, color: color(t.muted) })
      })
    }
    page.drawText(txt(slide.caption || deck.periodLabel), {
      x: 48,
      y: 70,
      size: 11,
      font: fonts.bold,
      color: color(t.accent),
    })
    return
  }

  if (slide.kicker) drawKicker(page, fonts.bold, slide.kicker, deck.theme)
  wrap(fonts.bold, slide.title, 26, slide.layout === "spotlight" ? 440 : 860).forEach((line, i) => {
    page.drawText(line, { x: 48, y: 430 - i * 30, size: 26, font: fonts.bold, color: color(t.ink) })
  })

  if (slide.body) {
    wrap(fonts.regular, slide.body, 12, slide.layout === "spotlight" ? 420 : 860).forEach((line, i) => {
      page.drawText(line, { x: 48, y: 360 - i * 16, size: 12, font: fonts.regular, color: color(t.muted) })
    })
  }

  if (slide.layout === "kpis") {
    drawMetrics(page, slide, fonts, deck.theme, 120)
    return
  }

  if (slide.layout === "spotlight") {
    const img = await embedUrl(pdf, cache, slide.imageUrl)
    if (img) page.drawImage(img, { x: 520, y: 70, width: 392, height: 300 })
    drawMetrics(page, slide, fonts, deck.theme, 70)
    if (slide.quote) {
      wrap(fonts.regular, `“${slide.quote}”`, 10, 400).forEach((line, i) => {
        page.drawText(line, { x: 48, y: 200 - i * 13, size: 10, font: fonts.regular, color: color(t.accent) })
      })
    }
    if (slide.caption) {
      page.drawText(txt(slide.caption).slice(0, 70), { x: 48, y: 48, size: 9, font: fonts.regular, color: color(t.muted) })
    }
    return
  }

  if (slide.layout === "gallery" && slide.items?.length) {
    const items = slide.items.slice(0, 4)
    const gw = (W - 96 - (items.length - 1) * 12) / items.length
    for (let i = 0; i < items.length; i++) {
      const x = 48 + i * (gw + 12)
      const img = await embedUrl(pdf, cache, items[i].imageUrl)
      page.drawRectangle({ x, y: 70, width: gw, height: 260, color: color(t.card) })
      if (img) page.drawImage(img, { x: x + 8, y: 150, width: gw - 16, height: 168 })
      wrap(fonts.bold, items[i].title, 10, gw - 20).slice(0, 2).forEach((line, li) => {
        page.drawText(line, { x: x + 12, y: 120 - li * 13, size: 10, font: fonts.bold, color: color(t.ink) })
      })
    }
    return
  }

  if (slide.layout === "quote" && slide.quote) {
    wrap(fonts.bold, `“${slide.quote}”`, 20, 800).forEach((line, i) => {
      page.drawText(line, { x: 80, y: 260 - i * 28, size: 20, font: fonts.bold, color: color(t.ink) })
    })
    if (slide.quoteBy) {
      page.drawText(slide.quoteBy, { x: 80, y: 150, size: 12, font: fonts.regular, color: color(t.accent) })
    }
    return
  }

  if (slide.layout === "chapter") {
    wrap(fonts.bold, slide.title, 32, 800).forEach((line, i) => {
      page.drawText(line, { x: 48, y: 300 - i * 38, size: 32, font: fonts.bold, color: color(t.ink) })
    })
    if (slide.body) {
      wrap(fonts.regular, slide.body, 14, 800).forEach((line, i) => {
        page.drawText(line, { x: 48, y: 200 - i * 18, size: 14, font: fonts.regular, color: color(t.muted) })
      })
    }
    return
  }

  if (slide.layout === "closing") {
    wrap(fonts.bold, slide.title, 32, 800).forEach((line, i) => {
      page.drawText(line, { x: 48, y: 280 - i * 38, size: 32, font: fonts.bold, color: color(t.ink) })
    })
    if (slide.body) {
      page.drawText(txt(slide.body).slice(0, 80), { x: 48, y: 180, size: 14, font: fonts.regular, color: color(t.muted) })
    }
    return
  }

  const bullets = slide.bullets || slide.items?.map((it) => [it.title, it.meta, it.text].filter(Boolean).join(" — ")) || []
  bullets.slice(0, 7).forEach((b, i) => {
    page.drawRectangle({ x: 48, y: 318 - i * 38, width: 6, height: 6, color: color(t.accent) })
    wrap(fonts.regular, b, 12, 820).slice(0, 2).forEach((line, li) => {
      page.drawText(line, { x: 66, y: 314 - i * 38 - li * 14, size: 12, font: fonts.regular, color: color(t.ink) })
    })
  })
}

export async function buildStoryPdf(deck: StoryDeck): Promise<Uint8Array> {
  const pdf = await PDFDocument.create()
  const regular = await pdf.embedFont(StandardFonts.Helvetica)
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold)
  const cache = new Map<string, PDFImage>()

  for (let i = 0; i < deck.slides.length; i++) {
    const page = pdf.addPage([W, H])
    await drawSlide(pdf, page, deck, deck.slides[i], { regular, bold }, cache, i)
  }

  pdf.setTitle(`${deck.organizationName} — ${deck.title}`)
  pdf.setAuthor("Tafsula Story Studio")
  return pdf.save()
}
