import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: ({ image }) =>
    z.object({
      date: z.coerce.date(),
      images: z.array(image()).default([]),
      sourceUrl: z.string().url().optional(),
    }),
})

// 月.上下旬 (1.0〜12.5, 0.5 刻み)。整数=上旬, .5=下旬。
// CSS Grid の列計算 (24 列) に直結するためスキーマで厳密に検証する。
const halfMonth = z
  .number()
  .min(1.0)
  .max(12.5)
  .refine((n) => n % 0.5 === 0, {
    message:
      '値は 1.0〜12.5 の 0.5 刻み（整数=上旬, .5=下旬）で指定してください',
  })

const crops = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/crops' }),
  schema: z.object({
    name: z.string(),
    emoji: z.string().optional(),
    color: z.string(),
    order: z.number().default(0),
    tasks: z.array(
      z.object({
        label: z.string(),
        start: halfMonth,
        end: halfMonth,
        volunteer: z.boolean().default(false),
        note: z.string().optional(),
      }),
    ),
  }),
})

const events = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/events' }),
  schema: z.object({
    name: z.string(),
    start: halfMonth,
    end: halfMonth,
    category: z.string().default('地域行事'),
    location: z.string().optional(),
    url: z.string().url().optional(),
    note: z.string().optional(),
  }),
})

export const collections = { posts, crops, events }
