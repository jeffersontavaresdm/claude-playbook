const RAW_BASE = import.meta.env.BASE_URL ?? '/';
const BASE = RAW_BASE.replace(/\/$/, '');

export function url(path = '/'): string {
	if (!path.startsWith('/')) path = '/' + path;
	return (BASE + path) || '/';
}

export function absoluteUrl(path: string, site: URL | string | undefined): string {
	if (!site) throw new Error('absoluteUrl: `site` is required');
	return new URL(url(path), site).toString();
}
