import { useEffect, useRef, useState, useCallback } from 'react'
import './StackGame.css'

const BRICK_H = 26
const PALETTE = ['#e2562a', '#c2401f', '#9b2d20', '#7c2418', '#b5361f']

export default function StackGame() {
  const canvasRef = useRef(null)
  const game = useRef(null)
  const phaseRef = useRef('ready') // 'ready' | 'playing' | 'over'
  const dprRef = useRef(1)

  const [phase, setPhase] = useState('ready')
  const [score, setScore] = useState(0)
  const [best, setBest] = useState(0)

  const setPhaseBoth = (p) => {
    phaseRef.current = p
    setPhase(p)
  }

  // size the backing store for crisp rendering
  const fitCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return null
    const rect = canvas.getBoundingClientRect()
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    dprRef.current = dpr
    canvas.width = Math.round(rect.width * dpr)
    canvas.height = Math.round(rect.height * dpr)
    const ctx = canvas.getContext('2d')
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    return { W: rect.width, H: rect.height, ctx }
  }, [])

  const startGame = useCallback(() => {
    const fit = fitCanvas()
    if (!fit) return
    const { W } = fit
    const baseW = Math.min(150, W * 0.42)
    game.current = {
      W,
      H: fit.H,
      bricks: [{ x: (W - baseW) / 2, w: baseW }],
      current: { x: 0, w: baseW, dir: 1, speed: 2.1 },
      offsetY: 0,
    }
    setScore(0)
    setPhaseBoth('playing')
  }, [fitCanvas])

  const drop = useCallback(() => {
    const g = game.current
    if (!g || phaseRef.current !== 'playing') return
    const top = g.bricks[g.bricks.length - 1]
    const cur = g.current
    const left = Math.max(cur.x, top.x)
    const right = Math.min(cur.x + cur.w, top.x + top.w)
    const overlap = right - left

    if (overlap <= 4) {
      setPhaseBoth('over')
      setBest((b) => Math.max(b, g.bricks.length - 1))
      return
    }

    g.bricks.push({ x: left, w: overlap })
    setScore(g.bricks.length - 1)
    g.current = {
      x: 0,
      w: overlap,
      dir: 1,
      speed: Math.min(6.2, cur.speed + 0.14),
    }
  }, [])

  // single action: tap/click/space behaves contextually
  const action = useCallback(() => {
    if (phaseRef.current === 'playing') drop()
    else startGame()
  }, [drop, startGame])

  // main render loop + input wiring
  useEffect(() => {
    const fit = fitCanvas()
    if (!fit) return
    let ctx = fit.ctx
    let raf

    const draw = () => {
      const g = game.current
      const canvas = canvasRef.current
      if (!canvas) return
      const W = g ? g.W : fit.W
      const H = g ? g.H : fit.H
      ctx.clearRect(0, 0, W, H)

      if (!g) {
        raf = requestAnimationFrame(draw)
        return
      }

      // move the active brick while playing
      if (phaseRef.current === 'playing') {
        const c = g.current
        c.x += c.dir * c.speed
        if (c.x <= 0) { c.x = 0; c.dir = 1 }
        if (c.x + c.w >= W) { c.x = W - c.w; c.dir = -1 }
      }

      // camera follows the top of the tower
      const target = Math.max(0, (g.bricks.length + 2) * BRICK_H - H * 0.58)
      g.offsetY += (target - g.offsetY) * 0.12

      // draw the stacked bricks
      g.bricks.forEach((b, i) => {
        const y = H - (i + 1) * BRICK_H + g.offsetY
        if (y > H || y < -BRICK_H) return
        paintBrick(ctx, b.x, y, b.w, BRICK_H, PALETTE[i % PALETTE.length])
      })

      // draw the active brick on top
      if (phaseRef.current === 'playing') {
        const i = g.bricks.length
        const y = H - (i + 1) * BRICK_H + g.offsetY
        paintBrick(ctx, g.current.x, y, g.current.w, BRICK_H, '#f08a4b', true)
      }

      raf = requestAnimationFrame(draw)
    }

    raf = requestAnimationFrame(draw)

    // input
    const canvas = canvasRef.current
    const onPointer = (e) => { e.preventDefault(); action() }
    const onKey = (e) => {
      if (e.code !== 'Space' && e.code !== 'Enter') return
      const r = canvasRef.current?.getBoundingClientRect()
      if (!r) return
      const inView = r.top < window.innerHeight && r.bottom > 0
      if (!inView) return
      e.preventDefault()
      action()
    }
    canvas.addEventListener('pointerdown', onPointer)
    window.addEventListener('keydown', onKey)

    // keep the canvas crisp on resize
    const ro = new ResizeObserver(() => {
      const f = fitCanvas()
      if (!f) return
      ctx = f.ctx
      if (game.current) game.current.W = f.W
    })
    ro.observe(canvas)

    return () => {
      cancelAnimationFrame(raf)
      canvas.removeEventListener('pointerdown', onPointer)
      window.removeEventListener('keydown', onKey)
      ro.disconnect()
    }
  }, [action, fitCanvas])

  return (
    <section className="game section" id="play">
      <div className="wrap">
        <div className="game__head">
          <div>
            <span className="eyebrow">Interlude · A small test of patience</span>
            <h2>Stack the Monolith</h2>
            <p className="game__sub">
              Tap, click, or press space to drop each brick. Build your legacy as high as it will stand.
            </p>
          </div>
          <div className="game__scoreboard">
            <div className="game__score">
              <span className="game__score-num">{score}</span>
              <span className="game__score-label">Height</span>
            </div>
            <div className="game__score">
              <span className="game__score-num">{best}</span>
              <span className="game__score-label">Best</span>
            </div>
          </div>
        </div>

        <div className="game__stage">
          <canvas ref={canvasRef} className="game__canvas" aria-label="Brick stacking game" />

          {phase !== 'playing' && (
            <div className="game__overlay">
              {phase === 'ready' ? (
                <>
                  <h3>Ready to build?</h3>
                  <p>One tap drops a brick. Miss the edge and the tower falls.</p>
                  <button className="btn btn--primary" onClick={startGame}>Start building</button>
                </>
              ) : (
                <>
                  <h3>Tower of {score}</h3>
                  <p>{verdict(score)}</p>
                  <button className="btn btn--primary" onClick={startGame}>Build again</button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function paintBrick(ctx, x, y, w, h, color, active = false) {
  ctx.fillStyle = color
  roundRect(ctx, x, y, w, h - 4, 3)
  ctx.fill()
  // top highlight
  ctx.fillStyle = 'rgba(255,255,255,0.10)'
  roundRect(ctx, x, y, w, (h - 4) * 0.4, 3)
  ctx.fill()
  if (active) {
    ctx.strokeStyle = 'rgba(236,228,214,0.5)'
    ctx.lineWidth = 1
    roundRect(ctx, x + 0.5, y + 0.5, w - 1, h - 5, 3)
    ctx.stroke()
  }
}

function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + rr, y)
  ctx.arcTo(x + w, y, x + w, y + h, rr)
  ctx.arcTo(x + w, y + h, x, y + h, rr)
  ctx.arcTo(x, y + h, x, y, rr)
  ctx.arcTo(x, y, x + w, y, rr)
  ctx.closePath()
}

function verdict(n) {
  if (n >= 18) return 'Architecturally significant. The committee is impressed.'
  if (n >= 10) return 'A respectable tower. Future generations may visit.'
  if (n >= 5) return 'A solid start. Rome was not stacked in a day.'
  return 'Gravity remains undefeated. Try once more.'
}
