const COLORS = ['#2563eb', '#7c3aed', '#059669', '#d97706', '#db2777', '#0891b2', '#eab308']

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  w: number
  h: number
  color: string
  rotation: number
  spin: number
  opacity: number
}

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

function createBurst(originX: number, originY: number): Particle[] {
  const particles: Particle[] = []
  const count = 80

  for (let i = 0; i < count; i += 1) {
    const angle = randomBetween(-Math.PI, Math.PI)
    const speed = randomBetween(6, 16)
    particles.push({
      x: originX,
      y: originY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - randomBetween(2, 8),
      w: randomBetween(6, 10),
      h: randomBetween(4, 8),
      color: COLORS[Math.floor(Math.random() * COLORS.length)] ?? COLORS[0],
      rotation: randomBetween(0, Math.PI * 2),
      spin: randomBetween(-0.2, 0.2),
      opacity: 1,
    })
  }

  return particles
}

/** Lightweight canvas confetti; no-op when prefers-reduced-motion. Returns cleanup. */
export function launchConfetti(durationMs = 4500): () => void {
  if (typeof window === 'undefined') {
    return () => undefined
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return () => undefined
  }

  const canvas = document.createElement('canvas')
  canvas.setAttribute('aria-hidden', 'true')
  canvas.style.cssText =
    'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9998'
  document.body.appendChild(canvas)

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    canvas.remove()
    return () => undefined
  }

  let width = window.innerWidth
  let height = window.innerHeight

  const resize = () => {
    width = window.innerWidth
    height = window.innerHeight
    canvas.width = width
    canvas.height = height
  }

  resize()
  window.addEventListener('resize', resize)

  let particles = [
    ...createBurst(width * 0.5, height * 0.35),
    ...createBurst(width * 0.2, height * 0.5),
    ...createBurst(width * 0.8, height * 0.5),
  ]

  const startedAt = performance.now()
  let raf = 0

  const tick = (now: number) => {
    const elapsed = now - startedAt
    if (elapsed > durationMs) {
      cleanup()
      return
    }

    ctx.clearRect(0, 0, width, height)

    for (const p of particles) {
      p.vy += 0.22
      p.vx *= 0.99
      p.x += p.vx
      p.y += p.vy
      p.rotation += p.spin
      p.opacity = Math.max(0, 1 - elapsed / durationMs)

      ctx.save()
      ctx.globalAlpha = p.opacity
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rotation)
      ctx.fillStyle = p.color
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
      ctx.restore()
    }

    particles = particles.filter((p) => p.y < height + 40 && p.opacity > 0.02)
    if (particles.length === 0 && elapsed < durationMs * 0.6) {
      particles = createBurst(width * 0.5, height * 0.25)
    }

    raf = window.requestAnimationFrame(tick)
  }

  const cleanup = () => {
    window.cancelAnimationFrame(raf)
    window.removeEventListener('resize', resize)
    canvas.remove()
  }

  raf = window.requestAnimationFrame(tick)

  return cleanup
}
