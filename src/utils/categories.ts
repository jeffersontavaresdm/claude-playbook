export type CategoryKey =
	| 'fundamentos'
	| 'comando'
	| 'pratica'
	| 'setup'
	| 'comparacao'
	| 'historia'
	| 'caso'
	| 'projeto';

export interface CategoryMeta {
	key: CategoryKey;
	label: string;
	slug: string;
	tagline: string;
	prompt: string;
}

export const CATEGORIES: Record<CategoryKey, CategoryMeta> = {
	fundamentos: {
		key: 'fundamentos',
		label: 'Fundamentos',
		slug: 'fundamentos',
		tagline: 'Trilha conceitual — teoria que ajuda a usar Claude melhor',
		prompt: 'cat fundamentos/',
	},
	comando: {
		key: 'comando',
		label: 'Comandos',
		slug: 'comandos',
		tagline: 'Slash commands e features do Claude Code documentados',
		prompt: 'ls comandos/',
	},
	pratica: {
		key: 'pratica',
		label: 'Prática',
		slug: 'pratica',
		tagline: 'Fluxos, hooks, técnicas e rotinas que aplico no dia a dia',
		prompt: 'ls pratica/',
	},
	setup: {
		key: 'setup',
		label: 'Setup',
		slug: 'setup',
		tagline: 'Configurações, templates e arquivos de partida',
		prompt: 'cat setup/',
	},
	comparacao: {
		key: 'comparacao',
		label: 'Comparações',
		slug: 'comparacoes',
		tagline: 'A vs B — quando usar cada um',
		prompt: 'diff comparacoes/',
	},
	historia: {
		key: 'historia',
		label: 'História',
		slug: 'historia',
		tagline: 'Marcos, papers fundadores e linha do tempo da IA',
		prompt: 'cat historia/',
	},
	caso: {
		key: 'caso',
		label: 'Casos',
		slug: 'casos',
		tagline: 'Case studies, post-mortems e análises de aplicações reais',
		prompt: 'ls casos/',
	},
	projeto: {
		key: 'projeto',
		label: 'Projetos',
		slug: 'projetos',
		tagline: 'Tutoriais end-to-end de construção (RAG, agentes, MCP)',
		prompt: 'ls projetos/',
	},
};

export const CATEGORY_LIST: CategoryMeta[] = Object.values(CATEGORIES);

export function getCategoryBySlug(slug: string): CategoryMeta | undefined {
	return CATEGORY_LIST.find((c) => c.slug === slug);
}
