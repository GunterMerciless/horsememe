import { useCallback, useEffect, useRef, useState } from 'react'
import {
  MIN_PARTS,
  MAX_PARTS,
  MIN_RATING,
  MAX_RATING,
  DEFAULT_RATING,
} from './constants'
import { drawCanvas } from './canvas/drawCanvas'
import { usePreloadImages } from './hooks/usePreloadImages'
import { clamp } from './utils/clamp'
import './App.css'

const INITIAL_PART_COUNT = 3
const INITIAL_IMAGE_NUMS = [10, 6, 2]
const INITIAL_TEXTS = ['', '', '']

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { imagesRef, imagesVersion } = usePreloadImages()

  const [partCount, setPartCount] = useState(INITIAL_PART_COUNT)
  const [imageNums, setImageNums] = useState<number[]>(INITIAL_IMAGE_NUMS)
  const [texts, setTexts] = useState<string[]>(INITIAL_TEXTS)
  const [topText, setTopText] = useState('')
  const [showDividers, setShowDividers] = useState(false)

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    drawCanvas(canvas, {
      imageNums,
      texts,
      topText,
      showDividers,
      getImages: () => imagesRef.current,
    })
  }, [imageNums, texts, topText, showDividers, imagesRef])

  useEffect(() => {
    draw()
  }, [draw, imagesVersion])

  const exportToPng = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.toBlob((blob) => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'horse-meme.png'
      a.click()
      URL.revokeObjectURL(url)
    }, 'image/png')
  }, [])

  const handlePartCountChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const count = clamp(parseInt(e.target.value) || MIN_PARTS, MIN_PARTS, MAX_PARTS)
      setPartCount(count)
      setImageNums((prev) => {
        const next = [...prev]
        while (next.length < count) next.push(DEFAULT_RATING)
        while (next.length > count) next.pop()
        return next
      })
      setTexts((prev) => {
        const next = [...prev]
        while (next.length < count) next.push('')
        while (next.length > count) next.pop()
        return next
      })
    },
    []
  )

  const handleImageNumChange = useCallback((index: number, value: string) => {
    const num = clamp(
      parseInt(value) || DEFAULT_RATING,
      MIN_RATING,
      MAX_RATING
    )
    setImageNums((prev) => {
      const next = [...prev]
      next[index] = num
      return next
    })
  }, [])

  const handleTextChange = useCallback((index: number, value: string) => {
    setTexts((prev) => {
      const next = [...prev]
      next[index] = value
      return next
    })
  }, [])

  return (
    <div className="app">
      <div className="header">
        <label style={{ marginLeft: '1em' }}>
          Number of seasons:{' '}
          <input
            type="number"
            min={MIN_PARTS}
            max={MAX_PARTS}
            value={partCount}
            onChange={handlePartCountChange}
            className="partsAmount"
          />
        </label>
        <input
          type="text"
          value={topText}
          onChange={(e) => setTopText(e.target.value)}
          placeholder="Title of the series"
        />
      </div>

      <div className="ratings">
        {imageNums.map((num, index) => (
          <div className="ratingsPart" key={index}>
            <label style={{display: 'inline-block', whiteSpace: 'nowrap'}}>Season {index + 1}:</label>
            <br />
            <input
              type="number"
              min={MIN_RATING}
              max={MAX_RATING}
              value={num}
              onChange={(e) => handleImageNumChange(index, e.target.value)}
            />
            <input
              type="text"
              value={texts[index] || ''}
              onChange={(e) => handleTextChange(index, e.target.value)}
              placeholder="Season title"
              style={{ width: '100%', padding: '0.25em' }}
            />
          </div>
        ))}
      </div>
      <div className="horseImage">
        {/*<canvas style={{position: 'absolute', left: '4em'}} ref={canvasRef} />*/}
        <canvas ref={canvasRef} />
      </div>
      {/*<div style={{position: 'absolute', bottom: '0'}} className="footer">*/}
      <div className="footer">
        <label className="checkboxLabel">
            <input
              type="checkbox"
              checked={showDividers}
              onChange={(e) => setShowDividers(e.target.checked)}
            />
            Dividers
        </label>

        <button type="button" onClick={exportToPng}>
          Download PNG
        </button>
      </div>
    </div>
  )
}

export default App
