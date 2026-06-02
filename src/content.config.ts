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

export const collections = { posts }
