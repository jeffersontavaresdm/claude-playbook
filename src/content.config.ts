import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const posts = defineCollection({
	loader: glob({ base: './src/content/posts', pattern: '**/*.{md,mdx}' }),
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			date: z.coerce.date(),
			updated: z.coerce.date().optional(),
			category: z.enum(['fundamentos', 'comando', 'pratica', 'setup', 'comparacao']),
			tags: z.array(z.string()).default([]),
			draft: z.boolean().default(false),
			cover: z.optional(image()),
		}),
});

export const collections = { posts };
