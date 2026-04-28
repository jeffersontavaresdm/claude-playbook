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

## Schema de post

```ts
{
  title: string,
  description: string,
  date: Date,            // formato YYYY-MM-DD
  updated?: Date,
  tags: string[],
  draft?: boolean,       // posts com draft:true ficam fora do build
  cover?: ImageMetadata
}
```

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

Se uma nova tag aparece em apenas 1 post, espere o segundo antes de promovê-la.

## Fluxo de criação de post (`/post`)

Existe um slash command `/post <assunto>` em `.claude/commands/post.md` que automatiza a criação de **qualquer tipo de post**: pesquisa na web, framing ancorado em uso prático com Claude, escrita 1500-2000 palavras, salva como `draft: true`, commita e pusha. O usuário lê o rascunho e, quando aprovar, pede pra publicar — você troca `draft: true` por `false`, commita e pusha de novo.

O comando classifica o post em uma das 4 categorias e ajusta estrutura/tag:

| Tipo | Para quê | Tag base |
|---|---|---|
| **fundamentos** | Teoria que ajuda a usar Claude (transformer, tokenização, atenção, etc.) | `fundamentos` |
| **prática** | Fluxos, hooks, técnicas, rotinas | `claude-code` |
| **comparação** | A vs B (skills vs commands, sonnet vs opus, etc.) | tag de cada lado |
| **setup** | Configurações, templates (CLAUDE.md, settings.json, etc.) | `settings`/`claude-md`/`documentação` |

Em qualquer tipo: gancho concreto na abertura, decisão prática no fechamento. Tom de notebook de quem aplica, não tutorial nem academia.

## Convenções de slug

Nome de arquivo do post = slug. Sem acentos, kebab-case, em português:
- ✅ `plan-mode-no-dia-a-dia.md`
- ❌ `meu-novo-post.md` (genérico demais)
- ❌ `plan_mode.md` (snake_case)

## Branch e deploy

- `main` é a branch principal. Push em main → GitHub Action builda e publica em `https://jeffersontavaresdm.github.io/claude-playbook`
- Não há ambiente de staging. Para post em rascunho, use `draft: true`
- Antes de push: `pnpm build` deve passar sem warning de schema

## Anti-padrões

- ❌ Adicionar React/Vue para "componente interativo" antes de realmente precisar
- ❌ Inflacionar `CLAUDE.md` com regras genéricas; mantenha enxuto
- ❌ Trocar `Tailwind v4` por `v3`; o projeto já é CSS-first
- ❌ Renomear estrutura `posts/` → `blog/`; rotas em pt-BR são intencionais
