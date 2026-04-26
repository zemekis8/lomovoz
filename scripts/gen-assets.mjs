#!/usr/bin/env node
/**
 * Генерує статичні візуальні ассети для production:
 *   - public/og-image.jpg          (1200×630 — для Telegram/FB/Twitter)
 *   - public/apple-touch-icon.png  (180×180 — для iOS home screen)
 *
 * Використовує sharp (libvips, headless, без GTK/X11 залежностей).
 */
import sharp from 'sharp'
import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'

// ============================================================
// OG IMAGE — 1200×630, темний бетон + brush ЛОМОВОЗ + tagline
// ============================================================
const ogSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2F2B26"/>
      <stop offset="50%" stop-color="#2A2723"/>
      <stop offset="100%" stop-color="#1F1C19"/>
    </linearGradient>
    <radialGradient id="glow1" cx="20%" cy="30%" r="50%">
      <stop offset="0%" stop-color="#D97706" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#D97706" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glow2" cx="80%" cy="80%" r="50%">
      <stop offset="0%" stop-color="#EA580C" stop-opacity="0.10"/>
      <stop offset="100%" stop-color="#EA580C" stop-opacity="0"/>
    </radialGradient>
    <filter id="noise">
      <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="3" seed="3"/>
      <feColorMatrix values="0 0 0 0 1  0 0 0 0 0.95  0 0 0 0 0.85  0 0 0 0.4 0"/>
      <feComposite in2="SourceGraphic" operator="in"/>
    </filter>
  </defs>

  <!-- background -->
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#glow1)"/>
  <rect width="1200" height="630" fill="url(#glow2)"/>

  <!-- noise overlay для бетонної текстури -->
  <rect width="1200" height="630" filter="url(#noise)" opacity="0.18"/>

  <!-- accent line top-left -->
  <line x1="80" y1="120" x2="180" y2="120" stroke="#D97706" stroke-width="2"/>
  <text x="200" y="128" fill="#D97706" font-family="Arial, sans-serif" font-size="18"
        font-weight="600" letter-spacing="3">КИЇВ ТА ОБЛАСТЬ</text>

  <!-- BRUSH LOMOVOZ — велика брендова надпис -->
  <text x="80" y="320" fill="#FAF7F1" font-family="'Caveat', 'Brush Script MT', cursive"
        font-size="200" font-weight="700" letter-spacing="-4">ЛОМОВОЗ<tspan fill="#D97706">.</tspan></text>

  <!-- Sub-headline -->
  <text x="80" y="410" fill="#FAF7F1" font-family="Arial, sans-serif" font-size="46"
        font-weight="900">Демонтаж та вивіз сміття</text>
  <text x="80" y="465" fill="#D97706" font-family="Arial, sans-serif" font-size="46"
        font-weight="900">під ключ</text>

  <!-- Tagline -->
  <text x="80" y="535" fill="#C9C2B5" font-family="Arial, sans-serif" font-size="22">
    Демонтуємо. Пакуємо. Вивозимо. Працюємо без вихідних.
  </text>

  <!-- Phone CTA bottom-right -->
  <rect x="850" y="510" width="270" height="56" rx="28" fill="#D97706"/>
  <text x="985" y="546" fill="#FAF7F1" font-family="Arial, sans-serif" font-size="22"
        font-weight="700" text-anchor="middle">+38 (050) 029-09-52</text>
</svg>`

// ============================================================
// APPLE TOUCH ICON — 180×180, бурштин + білий ЛВ monogram
// ============================================================
const iconSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 180 180">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#EA580C"/>
      <stop offset="100%" stop-color="#B45309"/>
    </linearGradient>
  </defs>
  <rect width="180" height="180" rx="40" fill="url(#bg)"/>
  <text x="90" y="120" fill="#FAF7F1" font-family="Arial, sans-serif" font-size="92"
        font-weight="900" text-anchor="middle" letter-spacing="-2">Л</text>
  <circle cx="146" cy="118" r="6" fill="#FAF7F1"/>
</svg>`

// ============================================================
// RENDER
// ============================================================
const outOg = '/home/oleg/lend d sasha/public/og-image.jpg'
const outIcon = '/home/oleg/lend d sasha/public/apple-touch-icon.png'

mkdirSync(dirname(outOg), { recursive: true })

await sharp(Buffer.from(ogSvg))
  .resize(1200, 630)
  .jpeg({ quality: 88, mozjpeg: true })
  .toFile(outOg)

console.log(`✓ ${outOg}`)

await sharp(Buffer.from(iconSvg))
  .resize(180, 180)
  .png({ quality: 95 })
  .toFile(outIcon)

console.log(`✓ ${outIcon}`)
