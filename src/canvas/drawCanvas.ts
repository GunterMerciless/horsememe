import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  TOP_TEXT_AREA_HEIGHT,
  DIVIDER_WIDTH,
  MAX_PARTS_NO_STRETCH,
} from '../constants'
import { getFontSizeToFit, drawTextWithStroke } from './textUtils'

export interface DrawCanvasParams {
  imageNums: number[]
  texts: string[]
  topText: string
  showDividers: boolean
  getImages: () => (HTMLImageElement | null)[]
}

/**
 * Draws the top text area (white band with centered text) if topText is non-empty.
 */
function drawTopTextArea(
  ctx: CanvasRenderingContext2D,
  topText: string,
  width: number
): void {
  ctx.fillStyle = 'grey'
  ctx.fillRect(0, 0, width, TOP_TEXT_AREA_HEIGHT)

  ctx.fillStyle = 'black'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  const padding = 20
  const availableWidth = width - padding * 2
  const fontSize = getFontSizeToFit(ctx, topText, availableWidth)
  ctx.font = `bold ${fontSize}px Arial`

  const textX = width / 2
  const textY = TOP_TEXT_AREA_HEIGHT / 2
  ctx.fillText(topText, textX, textY)
}

/**
 * Draws a single segment's image clipped to the segment rect.
 */
function drawSegmentImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  x_shift: number,
  sliceWidth: number,
  imageOffsetY: number,
  width: number
): void {
  ctx.save()
  ctx.beginPath()
  ctx.rect(x, imageOffsetY, sliceWidth, CANVAS_HEIGHT)
  ctx.clip()
  ctx.drawImage(
    img,
    x_shift,
    0,
    img.naturalWidth,
    img.naturalHeight,
    0,
    imageOffsetY,
    width,
    CANVAS_HEIGHT
  )
  ctx.restore()
}

/**
 * Draws the segment label (text with stroke) in the top part of the segment.
 */
function drawSegmentLabel(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  sliceWidth: number,
  imageOffsetY: number
): void {
  const padding = 16
  const availableWidth = sliceWidth - padding
  const fontSize = getFontSizeToFit(ctx, text, availableWidth)
  ctx.font = `bold ${fontSize}px Arial`
  ctx.lineWidth = Math.max(1, fontSize / 16)

  const textX = x + sliceWidth / 2
  const textY = imageOffsetY + 20
  drawTextWithStroke(ctx, text, textX, textY)
}

/**
 * Draws vertical black divider lines between segments.
 */
function drawDividers(
  ctx: CanvasRenderingContext2D,
  count: number,
  sliceWidth: number,
  imageOffsetY: number
): void {
  ctx.fillStyle = 'black'
  for (let i = 1; i < count; i++) {
    const lineX = sliceWidth * i - DIVIDER_WIDTH / 2
    ctx.fillRect(lineX, imageOffsetY, DIVIDER_WIDTH, CANVAS_HEIGHT)
  }
}

/**
 * Main draw: fills the canvas with the current composition (top text, segment images, labels, dividers).
 */
export function drawCanvas(
  canvas: HTMLCanvasElement,
  params: DrawCanvasParams
): void {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const { imageNums, texts, topText, showDividers, getImages } = params
  const total_count = imageNums.length

  const over_max_count      = total_count > MAX_PARTS_NO_STRETCH ? total_count - MAX_PARTS_NO_STRETCH : 0
  const under_max_count     = over_max_count > 0 ? MAX_PARTS_NO_STRETCH : total_count

  const sliceWidth = CANVAS_WIDTH / under_max_count // const after MAX_PARTS_NO_STRETCH (10)

  const hasTopText = topText.trim().length > 0
  const totalHeight = hasTopText
    ? CANVAS_HEIGHT + TOP_TEXT_AREA_HEIGHT
    : CANVAS_HEIGHT
  const imageOffsetY = hasTopText ? TOP_TEXT_AREA_HEIGHT : 0

  canvas.width = over_max_count > 0 ? CANVAS_WIDTH + sliceWidth * over_max_count : CANVAS_WIDTH
  canvas.height = totalHeight

  ctx.fillStyle = 'grey'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  if (hasTopText) {
    drawTopTextArea(ctx, topText, canvas.width)
  }


  const imgs = getImages()

  for (let i = 0; i < total_count; i++) {

    var img = imgs[imageNums[i]]

    if (!img?.complete) continue // ???

    const x = sliceWidth * i

    var x_shift = 0
    drawSegmentImage(ctx, img, x, x_shift, sliceWidth, imageOffsetY, canvas.width)

    if (texts[i]) {
      ctx.save()
      drawSegmentLabel(ctx, texts[i], x, sliceWidth, imageOffsetY)
      ctx.restore()
    }
  }

  if (showDividers && total_count > 1) {
    drawDividers(ctx, total_count, sliceWidth, imageOffsetY)
  }
}
