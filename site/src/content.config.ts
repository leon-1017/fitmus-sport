import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const products = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/content/products' }),
	schema: z.object({
		title: z.string(),
		slug: z.string(),
		category: z.string(),
		date: z.string().optional(),
		seoTitle: z.string().optional(),
		seoDescription: z.string().optional(),
		featuredImage: z.string().optional(),
		gallery: z.array(z.string()).default([]),
		related: z.array(z.string()).default([]),
	}),
});

const posts = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
	schema: z.object({
		title: z.string(),
		slug: z.string(),
		date: z.string().optional(),
		categories: z.array(z.string()).default([]),
		seoTitle: z.string().optional(),
		seoDescription: z.string().optional(),
		featuredImage: z.string().optional(),
	}),
});

export const collections = { products, posts };
