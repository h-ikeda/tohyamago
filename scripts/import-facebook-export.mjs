#!/usr/bin/env node
/*
 * Facebook ページのエクスポート (JSON 形式) を Astro Content Collection
 * 形式の Markdown + 画像に変換するスクリプト。
 *
 *   node scripts/import-facebook-export.mjs <エクスポートZIPを展開したパス>
 *
 * 出力:
 *   src/content/posts/YYYY-MM-DD-<n>.md
 *   src/content/posts/YYYY-MM-DD-<n>/<image>.jpg
 *
 * Facebook の公式エクスポートは "your_posts/your_posts_1.json" のような構造で、
 * 各投稿は { timestamp, data: [{ post }], attachments: [{ data: [{ media }] }] }
 * の形を取る。実際のエクスポートに合わせて parsePost を調整すること。
 */

import { readFile, writeFile, mkdir, cp } from 'node:fs/promises'
import { readdirSync, statSync } from 'node:fs'
import path from 'node:path'

const exportRoot = process.argv[2]
if (!exportRoot) {
  console.error('Usage: node scripts/import-facebook-export.mjs <export-root>')
  process.exit(1)
}

const outRoot = path.resolve('src/content/posts')
await mkdir(outRoot, { recursive: true })

function findJsonFiles(dir) {
  const found = []
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name)
    const st = statSync(full)
    if (st.isDirectory()) found.push(...findJsonFiles(full))
    else if (name.endsWith('.json') && /post/i.test(name)) found.push(full)
  }
  return found
}

function pad(n) {
  return String(n).padStart(2, '0')
}

function slugFor(date, seq) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}-${pad(seq)}`
}

function escapeYaml(str) {
  return `"${str.replace(/"/g, '\\"')}"`
}

/**
 * 1 件の投稿エントリを正規化する。
 * Facebook エクスポートのフィールド名は時期によって異なるため、
 * 必要に応じてここを調整する。
 */
function parsePost(entry, exportRoot) {
  const timestamp = entry.timestamp ?? entry.created_time
  if (!timestamp) return null
  const date = typeof timestamp === 'number' ? new Date(timestamp * 1000) : new Date(timestamp)

  const messages = []
  const images = []

  const collect = (node) => {
    if (!node || typeof node !== 'object') return
    if (Array.isArray(node)) {
      node.forEach(collect)
      return
    }
    if (typeof node.post === 'string' && node.post.trim()) messages.push(node.post)
    if (typeof node.message === 'string' && node.message.trim()) messages.push(node.message)
    if (node.media && typeof node.media.uri === 'string') {
      images.push(path.join(exportRoot, node.media.uri))
    }
    for (const key of Object.keys(node)) {
      if (key === 'media') continue
      collect(node[key])
    }
  }

  collect(entry)

  const body = [...new Set(messages)].join('\n\n').trim()
  if (!body && images.length === 0) return null

  return { date, body, images, sourceUrl: entry.permalink_url ?? null }
}

const jsonFiles = findJsonFiles(exportRoot)
if (jsonFiles.length === 0) {
  console.error(`No post JSON files found under ${exportRoot}`)
  process.exit(1)
}

const seqByDate = new Map()
let written = 0

for (const file of jsonFiles) {
  const json = JSON.parse(await readFile(file, 'utf8'))
  const entries = Array.isArray(json) ? json : Array.isArray(json.data) ? json.data : [json]

  for (const entry of entries) {
    const post = parsePost(entry, exportRoot)
    if (!post) continue
    const dateKey = post.date.toISOString().slice(0, 10)
    const seq = (seqByDate.get(dateKey) ?? 0) + 1
    seqByDate.set(dateKey, seq)
    const slug = slugFor(post.date, seq)
    const dir = path.join(outRoot, slug)
    await mkdir(dir, { recursive: true })

    const imageNames = []
    for (let i = 0; i < post.images.length; ++i) {
      const src = post.images[i]
      const ext = path.extname(src) || '.jpg'
      const name = `image-${pad(i + 1)}${ext}`
      await cp(src, path.join(dir, name))
      imageNames.push(name)
    }

    const frontmatter = [
      '---',
      `date: ${post.date.toISOString()}`,
      ...(imageNames.length
        ? ['images:', ...imageNames.map((n) => `  - ./${slug}/${n}`)]
        : []),
      ...(post.sourceUrl ? [`sourceUrl: ${escapeYaml(post.sourceUrl)}`] : []),
      '---',
      '',
      post.body,
      '',
    ].join('\n')

    await writeFile(path.join(outRoot, `${slug}.md`), frontmatter)
    written += 1
  }
}

console.log(`Imported ${written} posts into ${outRoot}`)
