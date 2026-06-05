# Claude Playbook — Guia para o Claude

Este é um blog estático em pt-BR sobre como uso o Claude no dia a dia. Mantenha **leveza**: sem dependências novas a menos que o post precise; sem refatoração que ninguém pediu.

## Stack

- **Astro 6** com Content Collections
- **Tailwind CSS v4** (CSS-first, sem `tailwind.config.js`)
- **Markdown** puro com frontmatter Zod-tipado
- **GitHub Pages** via Actions

## Comandos

- `pnpm dev` — servidor local em http://localhost:4321/claude-playbook
- `pnpm build` — build estático em `./dist`
- `pnpm preview` — serve o build

## Estrutura

- `src/content/posts/*.md` — posts (cria um arquivo por post)
- `src/pages/` — rotas
- `src/components/` — componentes Astro reutilizáveis
- `src/layouts/BaseLayout.astro` — shell de página comum
- `src/layouts/PostLayout.astro` — layout de post individual
- `src/styles/global.css` — Tailwind v4 + variáveis de tema (light/dark)
- `src/data/novidades.json` — quadro do radar `/novidades` (coleção própria, fora do feed de posts)

## Schema de post

```ts
{
  title: string,
  description: string,
  date: Date,            // formato YYYY-MM-DD
  updated?: Date,
  category: 'fundamentos' | 'comando' | 'pratica' | 'setup' | 'comparacao' | 'historia' | 'caso' | 'projeto',
  tags: string[],
  cover?: ImageMetadata
}
```

**Categorias** (sem acento, singular) organizam posts em `/categorias/<slug>`. Mapeamento label/slug em `src/utils/categories.ts`. A build falha se o valor não for um dos 8 acima — não invente nomes novos.

## Estilo de escrita

- **Primeira pessoa**, pt-BR informal mas técnico — como uma conversa entre devs
- Estrutura típica: **problema → como resolvi → trade-off / o que removi**
- Frases curtas. Parágrafos de 1–3 frases. Se você precisar de bullets, prefira-os a parágrafos longos
- Códigos em blocos com linguagem (` ```json `, ` ```ts `, ` ```bash `)
- Evite jargão de marketing. Não use "revolucionário", "incrível", "game-changer"

## Padrões de tags

Reutilize tags existentes antes de criar novas. Tags vivas atualmente:

- `claude-code` — qualquer coisa específica do CLI
- `plan-mode`, `hooks`, `skills`, `claude-md`, `settings`
- `fluxo` — rotinas e modos de trabalho
- `automação`, `contexto`, `documentação`
- `fundamentos` — trilha de fundamentos técnicos (LLMs, transformer, tokenização, atenção, etc.) que ajudam a usar Claude melhor
- `slash-command` — posts que documentam um slash command (built-in ou custom) em profundidade

Se uma nova tag aparece em apenas 1 post, espere o segundo antes de promovê-la.

**Anti-fragmentação:** nomes individuais de comandos/features (ex: `add-dir`, `clear`, `compact`) **não** viram tag. Use a categoria ampla (`slash-command`, `hooks`, `mcp`, etc.) e adicione a tag específica só se virar uma trilha de 2+ posts sobre aquele comando em particular. Caso contrário, a aba de tags vira ruído com dezenas de tags de 1 post só.

## Fluxo de criação de post (`/post`)

Existe um slash command `/post <assunto>` em `.claude/commands/post.md` que automatiza a criação de **qualquer tipo de post**: pesquisa na web, framing ancorado em uso prático com Claude, escrita, commit e push direto pra produção. Se o usuário não gostar depois da leitura, ele pede ajuste ou remoção.

O comando classifica o post em uma das 5 categorias e ajusta estrutura/tag:

| Tipo | Para quê | Tag base |
|---|---|---|
| **fundamentos** | Teoria que ajuda a usar Claude (transformer, tokenização, atenção, etc.) | `fundamentos` |
| **prática** | Fluxos, hooks, técnicas, rotinas | `claude-code` |
| **comparação** | A vs B (skills vs commands, sonnet vs opus, etc.) | tag de cada lado |
| **setup** | Configurações, templates (CLAUDE.md, settings.json, etc.) | `settings`/`claude-md`/`documentação` |
| **comando** | Documentar slash command ou feature do Claude Code (`/clear`, `/compact`, hooks, MCPs, etc.) | `claude-code` + `slash-command` + nome do comando |
| **história** | Linha do tempo, papers fundadores, marcos da IA (Turing, attention is all you need) | `historia` + tag específica |
| **caso** | Case study, post-mortem, análise de produto baseado em IA | `caso` + tag de domínio |
| **projeto** | Tutorial end-to-end de construção (RAG, agente, MCP server) | `projeto` + tag de tema |

Em qualquer tipo: gancho concreto na abertura, decisão prática no fechamento. Tom de notebook de quem aplica, não tutorial nem academia.

## Radar de novidades (`/novidades`)

Aba `/novidades` é um **radar rolante** das novidades de IA/tech dos últimos ~7 dias — não é post, é a notícia mastigada em pt-BR (TL;DR + resumo + link da fonte) pra eu ficar por dentro. Vive na coleção `novidades` (`src/data/novidades.json`), separada dos posts: **não aparece** em `/artigos`, tags, categorias nem RSS.

- Slash command `/novidades` em `.claude/commands/novidades.md`: busca os últimos 7 dias, dedupe contra o quadro, eu curo (entra/sai) e ele publica.
- Tamanho máximo em `NOVIDADES_MAX` (`src/consts.ts`, hoje 10). **Cap suave**: semana fraca mostra menos, não enche de filler.
- Resumo é **escrito**, nunca cópia do texto da fonte (direito autoral — repo público).
- **Boatos, rumores e vazamentos sempre ficam de fora** — só entra fato confirmado por fonte oficial ou reportagem confiável.

## Convenções de slug

Nome de arquivo do post = slug. Sem acentos, kebab-case, em português:
- ✅ `plan-mode-no-dia-a-dia.md`
- ❌ `meu-novo-post.md` (genérico demais)
- ❌ `plan_mode.md` (snake_case)

## Branch e deploy

- `main` é a branch principal. Push em main → GitHub Action builda e publica em `https://jeffersontavaresdm.github.io/claude-playbook`
- Não há ambiente de staging nem rascunho — tudo que entra em `main` vai pro ar. Se um post precisar sair, faça commit removendo o arquivo
- Antes de push: `pnpm build` deve passar sem warning de schema

## Anti-padrões

- ❌ Adicionar React/Vue para "componente interativo" antes de realmente precisar
- ❌ Inflacionar `CLAUDE.md` com regras genéricas; mantenha enxuto
- ❌ Trocar `Tailwind v4` por `v3`; o projeto já é CSS-first
- ❌ Renomear estrutura `posts/` → `blog/`; rotas em pt-BR são intencionais
