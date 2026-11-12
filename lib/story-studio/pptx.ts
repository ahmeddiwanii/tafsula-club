import PptxGenJS from "pptxgenjs"
import { fetchImageBytes, toBase64 } from "./media"
import { getTheme } from "./theme"
import type { StoryDeck, StorySlide } from "./types"

type PptxSlide = ReturnType<PptxGenJS["addSlide"]>

function hex(c: [number, number, number]) {
  return c.map((n) => n.toString(16).padStart(2, "0")).join("").toUpperCase()
}

async function dataUrl(url?: string) {
  if (!url) return undefined
  const img = await fetchImageBytes(url)
  if (!img) return undefined
  return `data:image/${img.kind === "png" ? "png" : "jpeg"};base64,${toBase64(img.bytes)}`
}

function addCover(slide: PptxSlide, deck: StoryDeck, s: StorySlide, image?: string) {
  const t = getTheme(deck.theme)
  slide.addText((s.kicker || "SEASON").toUpperCase(), {
    x: 0.55,
    y: 1.1,
    w: 6.2,
    h: 0.35,
    fontSize: 12,
    bold: true,
    color: hex(t.accent),
    fontFace: "Calibri",
    margin: 0,
  })
  slide.addText(s.title, {
    x: 0.55,
    y: 1.5,
    w: 6.4,
    h: 1.8,
    fontSize: 36,
    bold: true,
    color: hex(t.ink),
    fontFace: "Calibri",
    valign: "top",
  })
  if (s.body) {
    slide.addText(s.body, {
      x: 0.55,
      y: 3.5,
      w: 6.2,
      h: 1.6,
      fontSize: 16,
      color: hex(t.muted),
      fontFace: "Calibri",
    })
  }
  slide.addText(s.caption || deck.periodLabel, {
    x: 0.55,
    y: 6.55,
    w: 6,
    h: 0.35,
    fontSize: 13,
    bold: true,
    color: hex(t.accent),
    fontFace: "Calibri",
  })
  if (image) {
    slide.addImage({ data: image, x: 7.15, y: 0.7, w: 5.7, h: 6.1 })
    slide.addShape("rect", { x: 7.15, y: 0.7, w: 0.12, h: 6.1, fill: { color: hex(t.accent) } })
  }
}

function addMetrics(slide: PptxSlide, s: StorySlide, theme: StoryDeck["theme"], y = 4.3) {
  const t = getTheme(theme)
  const metrics = s.metrics?.slice(0, 4) || []
  metrics.forEach((m, i) => {
    const x = 0.55 + i * 3.15
    slide.addShape("roundRect", {
      x,
      y,
      w: 2.95,
      h: 1.7,
      fill: { color: hex(t.card) },
      rectRadius: 0.08,
    })
    slide.addText(m.value, {
      x,
      y: y + 0.28,
      w: 2.95,
      h: 0.7,
      fontSize: 28,
      bold: true,
      align: "center",
      color: hex(t.ink),
      fontFace: "Calibri",
    })
    slide.addText(m.label, {
      x,
      y: y + 1.0,
      w: 2.95,
      h: 0.4,
      fontSize: 12,
      align: "center",
      color: hex(t.muted),
      fontFace: "Calibri",
    })
  })
}

export async function buildStoryPptx(deck: StoryDeck): Promise<Buffer> {
  const pptx = new PptxGenJS()
  pptx.defineLayout({ name: "TAFSULA", width: 13.333, height: 7.5 })
  pptx.layout = "TAFSULA"
  pptx.title = `${deck.organizationName} — ${deck.title}`
  pptx.author = "Tafsula Story Studio"
  pptx.subject = deck.periodLabel

  const t = getTheme(deck.theme)

  for (const s of deck.slides) {
    const slide = pptx.addSlide()
    slide.addShape("rect", { x: 0, y: 0, w: 13.333, h: 7.5, fill: { color: hex(t.bg) } })
    slide.addShape("rect", { x: 0, y: 0, w: 0.12, h: 7.5, fill: { color: hex(t.accent) } })
    slide.addText(`${deck.organizationName}  ·  ${deck.periodLabel}`, {
      x: 0.5,
      y: 7.1,
      w: 10,
      h: 0.25,
      fontSize: 10,
      color: hex(t.muted),
      fontFace: "Calibri",
    })

    if (s.layout === "cover") {
      addCover(slide, deck, s, await dataUrl(s.imageUrl || deck.coverUrl || undefined))
      continue
    }

    if (s.kicker) {
      slide.addText(s.kicker.toUpperCase(), {
        x: 0.55,
        y: 0.4,
        w: 12,
        h: 0.3,
        fontSize: 11,
        bold: true,
        color: hex(t.accent),
        fontFace: "Calibri",
        margin: 0,
      })
    }
    slide.addText(s.title, {
      x: 0.55,
      y: 0.75,
      w: s.layout === "spotlight" ? 6.6 : 12.2,
      h: 1.1,
      fontSize: 26,
      bold: true,
      color: hex(t.ink),
      fontFace: "Calibri",
    })
    if (s.body) {
      slide.addText(s.body, {
        x: 0.55,
        y: 1.9,
        w: s.layout === "spotlight" ? 6.6 : 12.2,
        h: 1.1,
        fontSize: 15,
        color: hex(t.muted),
        fontFace: "Calibri",
      })
    }

    if (s.layout === "kpis") {
      addMetrics(slide, s, deck.theme, 3.5)
      continue
    }

    if (s.layout === "spotlight") {
      const image = await dataUrl(s.imageUrl)
      if (image) slide.addImage({ data: image, x: 7.5, y: 0.85, w: 5.3, h: 5.4 })
      addMetrics(slide, s, deck.theme, 4.7)
      continue
    }

    if (s.layout === "gallery" && s.items?.length) {
      const items = s.items.slice(0, 4)
      for (let i = 0; i < items.length; i++) {
        const x = 0.5 + i * 3.2
        slide.addShape("roundRect", { x, y: 3.15, w: 3.0, h: 3.5, fill: { color: hex(t.card) } })
        const image = await dataUrl(items[i].imageUrl)
        if (image) slide.addImage({ data: image, x: x + 0.12, y: 3.3, w: 2.76, h: 2.2 })
        slide.addText(items[i].title, {
          x: x + 0.12,
          y: 5.6,
          w: 2.76,
          h: 0.8,
          fontSize: 12,
          bold: true,
          color: hex(t.ink),
          fontFace: "Calibri",
        })
      }
      continue
    }

    if (s.layout === "quote" && s.quote) {
      slide.addText(`“${s.quote}”`, {
        x: 1.1,
        y: 2.4,
        w: 11,
        h: 2.4,
        fontSize: 24,
        italic: true,
        color: hex(t.ink),
        fontFace: "Calibri",
      })
      if (s.quoteBy) {
        slide.addText(s.quoteBy, {
          x: 1.1,
          y: 5.0,
          w: 11,
          h: 0.4,
          fontSize: 14,
          color: hex(t.accent),
          fontFace: "Calibri",
        })
      }
      continue
    }

    const bullets = s.bullets || s.items?.map((it) => [it.title, it.meta].filter(Boolean).join(" — ")) || []
    if (bullets.length) {
      slide.addText(
        bullets.slice(0, 7).map((b) => ({ text: b, options: { bullet: true, breakLine: true } })),
        {
          x: 0.7,
          y: 3.1,
          w: 12,
          h: 3.6,
          fontSize: 16,
          color: hex(t.ink),
          fontFace: "Calibri",
          paraSpaceAfter: 10,
        },
      )
    }
  }

  const out = await pptx.write({ outputType: "nodebuffer" })
  return Buffer.from(out as Buffer)
}
