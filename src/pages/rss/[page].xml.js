import { getAllPostsSorted, getRSSFeed, getRSSPageCount } from '../../utils/feed.js';

export async function getStaticPaths() {
	const all = await getAllPostsSorted();
	const totalPages = getRSSPageCount(all.length);
	const extraPages = [];
	for (let p = 2; p <= totalPages; p++) {
		extraPages.push({ params: { page: String(p) } });
	}
	return extraPages;
}

export const GET = (context) => getRSSFeed(context, Number(context.params.page));
