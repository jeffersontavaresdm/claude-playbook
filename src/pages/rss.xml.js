import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE_DESCRIPTION, SITE_TITLE } from '../consts';
import { url } from '../utils/url';

export async function GET(context) {
	const posts = (await getCollection('posts', ({ data }) => !data.draft)).sort(
		(a, b) => b.data.date.valueOf() - a.data.date.valueOf(),
	);
	const baseSite = new URL(url('/'), context.site).toString();
	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: baseSite,
		stylesheet: url('/rss.xsl'),
		items: posts.map((post) => ({
			title: post.data.title,
			description: post.data.description,
			pubDate: post.data.date,
			link: url(`/artigos/${post.id}/`),
			categories: post.data.tags,
		})),
		customData: '<language>pt-BR</language>',
	});
}
