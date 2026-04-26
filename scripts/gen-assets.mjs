#!/usr/bin/env node
/**
 * Генерує статичні візуальні ассети для production:
 *   - public/favicon.svg            (32×32 — SVG, scales infinitely)
 *   - public/og-image.jpg           (1200×630 — соцмережі)
 *   - public/apple-touch-icon.png   (180×180 — iOS home screen)
 *
 * Дизайн: жовтий квадрат із заокругленими кутами + білий молот всередині.
 * Палітра відповідає сайту: --color-accent #EAB308, --color-darker #09090B.
 */
import sharp from 'sharp'
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname } from 'node:path'

const HAMMER_PATH = `<path d="m15 12-8.373 8.373a1 1 0 1 1-3-3L12 9" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="m18 15 4-4" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="m21.5 11.5-1.914-1.914A2 2 0 0 1 19 8.172V7l-2.26-2.26a6 6 0 0 0-4.202-1.756L9 2.96l.92.82A6.18 6.18 0 0 1 12 8.4V10l2 2h1.172a2 2 0 0 1 1.414.586L18.5 14.5" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`

// ============================================================
// FAVICON SVG — універсальний для всіх розмірів
// ============================================================
const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="6" fill="#EAB308"/>
  <g transform="translate(4 4) scale(1)" fill="none" stroke="#09090B">${HAMMER_PATH}</g>
</svg>`

// ============================================================
// OG IMAGE — 1200×630, темний фон + жовте лого + жирний типограф
// ============================================================
const ogSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#27272A"/>
      <stop offset="50%" stop-color="#18181B"/>
      <stop offset="100%" stop-color="#09090B"/>
    </linearGradient>
    <radialGradient id="glow1" cx="80%" cy="20%" r="50%">
      <stop offset="0%" stop-color="#EAB308" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="#EAB308" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glow2" cx="15%" cy="85%" r="45%">
      <stop offset="0%" stop-color="#FACC15" stop-opacity="0.13"/>
      <stop offset="100%" stop-color="#FACC15" stop-opacity="0"/>
    </radialGradient>
    <filter id="noise">
      <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" seed="3"/>
      <feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.4 0"/>
      <feComposite in2="SourceGraphic" operator="in"/>
    </filter>
  </defs>

  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#glow1)"/>
  <rect width="1200" height="630" fill="url(#glow2)"/>
  <rect width="1200" height="630" filter="url(#noise)" opacity="0.10"/>

  <!-- LOGO LOCKUP -->
  <rect x="80" y="100" width="80" height="80" rx="14" fill="#EAB308"/>
  <g transform="translate(96 116) scale(2)" fill="none" stroke="#09090B" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="m15 12-8.373 8.373a1 1 0 1 1-3-3L12 9"/>
    <path d="m18 15 4-4"/>
    <path d="m21.5 11.5-1.914-1.914A2 2 0 0 1 19 8.172V7l-2.26-2.26a6 6 0 0 0-4.202-1.756L9 2.96l.92.82A6.18 6.18 0 0 1 12 8.4V10l2 2h1.172a2 2 0 0 1 1.414.586L18.5 14.5"/>
  </g>
  <text x="180" y="158" fill="#FAFAFA" font-family="Arial Black, Arial, sans-serif"
        font-size="56" font-weight="900" letter-spacing="-1">ЛОМОВОЗ</text>

  <!-- Region pill -->
  <rect x="80" y="220" width="280" height="40" rx="20" fill="rgba(234, 179, 8, 0.15)" stroke="rgba(234, 179, 8, 0.4)"/>
  <text x="220" y="246" fill="#FACC15" font-family="Arial, sans-serif" font-size="14"
        font-weight="700" letter-spacing="2" text-anchor="middle">КИЇВ ТА ОБЛАСТЬ</text>

  <!-- H1 -->
  <text x="80" y="340" fill="#FAFAFA" font-family="Arial Black, Arial, sans-serif"
        font-size="64" font-weight="900" letter-spacing="-1">Демонтаж та вивіз сміття</text>
  <text x="80" y="410" fill="#EAB308" font-family="Arial Black, Arial, sans-serif"
        font-size="64" font-weight="900" letter-spacing="-1">за 1 день — від 1000 ₴</text>

  <!-- Tagline -->
  <text x="80" y="475" fill="#D4D4D8" font-family="Arial, sans-serif" font-size="22">
    Демонтуємо. Пакуємо. Вивозимо. Без передоплати, виїзд за 1 годину.
  </text>

  <!-- Phone CTA -->
  <rect x="80" y="510" width="380" height="62" rx="31" fill="#EAB308"/>
  <text x="270" y="550" fill="#09090B" font-family="Arial Black, Arial, sans-serif" font-size="22"
        font-weight="900" text-anchor="middle">+38 (050) 029-09-52</text>

  <!-- Stars -->
  <g transform="translate(820 540)">
    <text fill="#EAB308" font-family="Arial, sans-serif" font-size="32" font-weight="900">★★★★★</text>
    <text x="0" y="32" fill="#D4D4D8" font-family="Arial, sans-serif" font-size="16">4.9 / 5 · 127 відгуків</text>
  </g>
</svg>`

// ============================================================
// APPLE TOUCH ICON — 180×180, жовтий квадрат + темний молот
// ============================================================
const iconSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 180 180">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FACC15"/>
      <stop offset="100%" stop-color="#EAB308"/>
    </linearGradient>
  </defs>
  <rect width="180" height="180" rx="40" fill="url(#bg)"/>
  <g transform="translate(45 45) scale(3.75)" fill="none" stroke="#09090B" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
    <path d="m15 12-8.373 8.373a1 1 0 1 1-3-3L12 9"/>
    <path d="m18 15 4-4"/>
    <path d="m21.5 11.5-1.914-1.914A2 2 0 0 1 19 8.172V7l-2.26-2.26a6 6 0 0 0-4.202-1.756L9 2.96l.92.82A6.18 6.18 0 0 1 12 8.4V10l2 2h1.172a2 2 0 0 1 1.414.586L18.5 14.5"/>
  </g>
</svg>`

// ============================================================
// RENDER
// ============================================================
const PUB = '/home/oleg/lend d sasha/public'
mkdirSync(PUB, { recursive: true })

writeFileSync(`${PUB}/favicon.svg`, faviconSvg)
console.log(`✓ ${PUB}/favicon.svg`)

await sharp(Buffer.from(ogSvg))
  .resize(1200, 630)
  .jpeg({ quality: 88, mozjpeg: true })
  .toFile(`${PUB}/og-image.jpg`)
console.log(`✓ ${PUB}/og-image.jpg`)

await sharp(Buffer.from(iconSvg))
  .resize(180, 180)
  .png({ quality: 95 })
  .toFile(`${PUB}/apple-touch-icon.png`)
console.log(`✓ ${PUB}/apple-touch-icon.png`)
