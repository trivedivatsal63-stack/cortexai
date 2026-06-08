'use client'
import { useEffect, useRef } from 'react'

interface Particle {
  x: number; y: number; vx: number; vy: number; radius: number
}

export default function NetworkBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    let particles: Particle[] = []
    const PARTICLE_COUNT = 120
    const CONNECTION_DIST = 140
    const MOUSE_INFLUENCE = 60

    const mouse = { x: -1000, y: -1000 }

    function resize() {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    function initParticles() {
      particles = Array.from({ length: PARTICLE_COUNT }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 2 + 1,
      }))
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]

        p.x += p.vx
        p.y += p.vy

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1

        const dx = mouse.x - p.x
        const dy = mouse.y - p.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < MOUSE_INFLUENCE) {
          p.x -= dx * 0.02
          p.y -= dy * 0.02
        }

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(124, 106, 247, 0.6)'
        ctx.fill()
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < CONNECTION_DIST) {
            const alpha = (1 - dist / CONNECTION_DIST) * 0.35
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(124, 106, 247, ${alpha})`
            ctx.lineWidth = 0.6
            ctx.stroke()
          }
        }
      }

      animId = requestAnimationFrame(draw)
    }

    function onMouse(e: MouseEvent) {
      mouse.x = e.clientX
      mouse.y = e.clientY
    }

    function onLeave() {
      mouse.x = -1000
      mouse.y = -1000
    }

    resize()
    initParticles()
    draw()
    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', onMouse)
    window.addEventListener('mouseleave', onLeave)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouse)
      window.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0, maxWidth: '100vw' }}
    />
  )
}
