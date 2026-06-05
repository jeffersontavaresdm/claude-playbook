import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';

const posts = defineCollection({
	loader: glob({ base: './src/content/posts', pattern: '**/*.{md,mdx}' }),
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			date: z.coerce.date(),
			updated: z.coerce.date().optional(),
			category: z.enum([
				'fundamentos',
				'comando',
				'pratica',
				'setup',
				'comparacao',
				'historia',
				'caso',
				'projeto',
			]),
			tags: z.array(z.string()).default([]),
			cover: z.optional(image()),
		}),
});

const novidades = defineCollection({
	loader: file('./src/data/novidades.json'),
	schema: z.object({
		titulo: z.string(),
		tldr: z.string(),
		resumo: z.string(),
		fonteNome: z.string(),
		fonteUrl: z.string().url(),
		data: z.coerce.date(),
	}),
});

export const collections = { posts, novidades };
