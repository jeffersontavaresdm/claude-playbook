import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE_DESCRIPTION, SITE_TITLE } from '../consts.ts';
import { url } from './url.ts';

export const RSS_PAGE_SIZE = 5;
const PLAYBOOK_NS = 'https://jeffersontavaresdm.github.io/claude-playbook/ns';

export async function getAllPostsSorted() {
	const all = await getCollection('posts');
	return all.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export function getRSSPageCount(total) {
	return Math.max(1, Math.ceil(total / RSS_PAGE_SIZE));
}

export async function getRSSFeed(context, currentPage) {
	const all = await getAllPostsSorted();
	const totalPages = getRSSPageCount(all.length);
	const start = (currentPage - 1) * RSS_PAGE_SIZE;
	const items = all.slice(start, start + RSS_PAGE_SIZE);

	const pageHref = (n) =>
		new URL(n === 1 ? url('/rss.xml') : url(`/rss/${n}.xml`), context.site).toString();

	const navLinks = [
		`<atom:link rel="first" href="${pageHref(1)}" />`,
		`<atom:link rel="last" href="${pageHref(totalPages)}" />`,
	];
	if (currentPage > 1) {
		navLinks.push(`<atom:link rel="prev" href="${pageHref(currentPage - 1)}" />`);
	}
	if (currentPage < totalPages) {
		navLinks.push(`<atom:link rel="next" href="${pageHref(currentPage + 1)}" />`);
	}
	navLinks.push(`<playbook:currentPage>${currentPage}</playbook:currentPage>`);
	navLinks.push(`<playbook:totalPages>${totalPages}</playbook:totalPages>`);

	const titleSuffix = currentPage === 1 ? '' : ` · página ${currentPage}/${totalPages}`;

	return rss({
		title: SITE_TITLE + titleSuffix,
		description: SITE_DESCRIPTION,
		site: new URL(url('/'), context.site).toString(),
		stylesheet: url('/rss.xsl'),
		items: items.map((post) => ({
			title: post.data.title,
			description: post.data.description,
			pubDate: post.data.date,
			link: url(`/artigos/${post.id}/`),
			categories: post.data.tags,
		})),
		customData: '<language>pt-BR</language>' + navLinks.join(''),
		xmlns: {
			atom: 'http://www.w3.org/2005/Atom',
			playbook: PLAYBOOK_NS,
		},
	});
}
