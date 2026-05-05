// @ts-check
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig, fontProviders } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

function rehypeOpenInNewTab() {
	const walk = (node) => {
		if (node.type === 'element' && node.tagName === 'a') {
			const href = node.properties?.href;
			if (typeof href === 'string') {
				const isPostRef = href.includes('/artigos/');
				const isExternal = /^https?:\/\//i.test(href);
				if (isPostRef || isExternal) {
					node.properties.target = '_blank';
					node.properties.rel = 'noopener noreferrer';
				}
			}
		}
		if (node.children) for (const child of node.children) walk(child);
	};
	return (tree) => walk(tree);
}

export default defineConfig({
	site: 'https://jeffersontavaresdm.github.io',
	base: '/claude-playbook',
	trailingSlash: 'ignore',
	integrations: [mdx(), sitemap()],
	markdown: {
		shikiConfig: {
			themes: { light: 'github-light', dark: 'github-dark-dimmed' },
			defaultColor: false,
			wrap: true,
		},
		rehypePlugins: [rehypeOpenInNewTab],
	},
	fonts: [
		{
			provider: fontProviders.google(),
			name: 'JetBrains Mono',
			cssVariable: '--font-mono',
			fallbacks: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
			weights: [400, 500, 700],
			styles: ['normal', 'italic'],
			subsets: ['latin', 'latin-ext'],
		},
		{
			provider: fontProviders.google(),
			name: 'IBM Plex Sans',
			cssVariable: '--font-sans',
			fallbacks: ['ui-sans-serif', 'system-ui', 'sans-serif'],
			weights: [400, 500, 600, 700],
			subsets: ['latin', 'latin-ext'],
		},
	],
	vite: {
		plugins: [tailwindcss()],
	},
});
