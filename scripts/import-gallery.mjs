#!/usr/bin/env node
/**
 * Імпортує фото з /home/oleg/фото дядя Саша работа/, конвертує JPG → WebP
 * (quality 82, ширина до 1600px), зберігає у public/img/gallery/01..NN.webp
 *
 * Автоматично відсіює screenshots з телефону (portrait extreme aspect) — їх
 * можна впізнати по співвідношенню сторін: смартфон-скрін має aspect ≈ 0.46
 * (9:19.5), тоді як знімки з камери — 4:3 або 16:9.
 */
import sharp from 'sharp'
import { readdirSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const SRC = '/home/oleg/фото дядя Саша работа'
const DST = '/home/oleg/lend d sasha/public/img/gallery'

mkdirSync(DST, { recursive: true })

const files = readdirSync(SRC)
  .filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f))
  .sort()  // chronological by Telegram timestamp prefix

const accepted = []
const skipped = []

for (const file of files) {
  const src = join(SRC, file)
  const meta = await sharp(src).metadata()
  const aspect = meta.width / meta.height

  // Skip portrait screenshots (телефонний скрін)
  if (aspect < 0.6) {
    skipped.push({ file, reason: `portrait screenshot ${meta.width}x${meta.height}`, aspect: aspect.toFixed(2) })
    continue
  }

  accepted.push({ file, src, width: meta.width, height: meta.height })
}

console.log(`Accepted: ${accepted.length}, skipped: ${skipped.length}`)
if (skipped.length) console.log('Skipped:', skipped)

// Convert with sequential naming
const results = []
for (let i = 0; i < accepted.length; i++) {
  const num = String(i + 1).padStart(2, '0')
  const out = join(DST, `${num}.webp`)
  await sharp(accepted[i].src)
    .resize({ width: 1600, withoutEnlargement: true })
    .webp({ quality: 82, effort: 4 })
    .toFile(out)
  const stats = await sharp(out).metadata()
  results.push({ name: `${num}.webp`, w: stats.width, h: stats.height })
  console.log(`  ✓ ${num}.webp  ${stats.width}×${stats.height}`)
}

console.log(`\nTotal photos in gallery: ${results.length}`)
