#!/usr/bin/env node
/*
 * Facebook ページのエクスポート (JSON 形式) を Astro Content Collection
 * 形式の Markdown + 画像に変換するスクリプト。
 *
 *   node scripts/import-facebook-export.mjs <エクスポートZIPを展開したパス>
 *
 * 出力:
 *   src/content/posts/YYYY-MM-DD-<n>.md
 *   src/content/posts/YYYY-MM-DD-<n>/image-NN.jpg
 *
 * Facebook の公式エクスポート (「Facebookにおけるあなたのアクティビティ」→
 * 「投稿」) は this_profile's_activity_across_facebook/posts/profile_posts_*.json
 * のような構造で、各投稿は
 *   {
 *     timestamp,
 *     data: [{ post }],
 *     attachments: [{ data: [{ media: { uri } } | { external_context: { url } }] }],
 *     title,
 *   }
 * の形を取る。
 *
 * 文字エンコーディングについて:
 *   Facebook のエクスポートは UTF-8 の各バイトを \u00XX としてエスケープした
 *   「mojibake」状態で出力される (例: 日本語が "ä¸..." のように見える)。
 *   JSON.parse 後に latin1 → utf8 で再デコードすると正しい文字列に戻る。
 *
 * 画像について:
 *   media.uri が指すファイルがローカルに存在する場合のみ co-located ディレクトリへ
 *   コピーし、frontmatter の images に登録する。存在しない場合は警告を出してスキップ
 *   する (テキストだけの取り込みも可能にするため)。
 */

import { readFile, writeFile, mkdir, cp } from 'node:fs/promises'
import { readdirSync, statSync, existsSync } from 'node:fs'
import path from 'node:path'

const exportRoot = process.argv[2]
if (!exportRoot) {
  console.error('Usage: node scripts/import-facebook-export.mjs <export-root>')
  process.exit(1)
}

const outRoot = path.resolve('src/content/posts')
await mkdir(outRoot, { recursive: true })

/** Facebook エクスポート特有の mojibake (latin1 で読まれた UTF-8) を修復する。 */
function fixMojibake(value) {
  if (typeof value === 'string') {
    return Buffer.from(value, 'latin1').toString('utf8')
  }
  if (Array.isArray(value)) return value.map(fixMojibake)
  if (value && typeof value === 'object') {
    const out = {}
    for (const [k, v] of Object.entries(value)) out[k] = fixMojibake(v)
    return out
  }
  return value
}

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
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}-${pad(seq)}`
}

function escapeYaml(str) {
  return `"${str.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`
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
  let sourceUrl = entry.permalink_url ?? null

  const collect = (node) => {
    if (!node || typeof node !== 'object') return
    if (Array.isArray(node)) {
      node.forEach(collect)
      return
    }
    if (typeof node.post === 'string' && node.post.trim()) messages.push(node.post)
    if (typeof node.message === 'string' && node.message.trim()) messages.push(node.message)
    if (node.external_context && typeof node.external_context.url === 'string' && !sourceUrl) {
      sourceUrl = node.external_context.url
    }
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

  return { date, body, images, sourceUrl }
}

const jsonFiles = findJsonFiles(exportRoot)
if (jsonFiles.length === 0) {
  console.error(`No post JSON files found under ${exportRoot}`)
  process.exit(1)
}

const seqByDate = new Map()
let written = 0
let missingImages = 0

for (const file of jsonFiles) {
  const json = fixMojibake(JSON.parse(await readFile(file, 'utf8')))
  const entries = Array.isArray(json) ? json : Array.isArray(json.data) ? json.data : [json]

  for (const entry of entries) {
    const post = parsePost(entry, exportRoot)
    if (!post) continue

    // ローカルに存在する画像だけを対象にする。
    const existing = post.images.filter((src) => existsSync(src))
    missingImages += post.images.length - existing.length

    // 本文も画像も無い投稿 (場所チェックインのみ等) はスキップする。
    if (!post.body && existing.length === 0) continue

    const dateKey = slugFor(post.date, 0).slice(0, 10)
    const seq = (seqByDate.get(dateKey) ?? 0) + 1
    seqByDate.set(dateKey, seq)
    const slug = slugFor(post.date, seq)
    const dir = path.join(outRoot, slug)

    const imageNames = []
    for (const src of existing) {
      const ext = path.extname(src) || '.jpg'
      const name = `image-${pad(imageNames.length + 1)}${ext}`
      await mkdir(dir, { recursive: true })
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
if (missingImages > 0) {
  console.warn(
    `${missingImages} 枚の画像がエクスポート内に見つからずスキップしました ` +
      `(完全なエクスポートを展開したパスを指定すると画像も取り込まれます)`,
  )
}
