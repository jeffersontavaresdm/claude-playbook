# Claude Playbook

Blog pessoal sobre como uso o **Claude** no dia a dia: fluxos, hooks, skills, prompts e pequenas descobertas.

→ Site: https://jeffersontavaresdm.github.io/claude-playbook

Sem fórmula mágica de IA. Só o que tem funcionado pra mim, o que não funcionou, e por quê.

## Stack

- [Astro 6](https://astro.build/) — framework estático
- [Tailwind CSS v4](https://tailwindcss.com/) — estilização CSS-first
- Markdown + Content Collections com schema Zod
- Deploy via GitHub Actions → GitHub Pages

## Rodar localmente

```bash
pnpm install
pnpm dev    # http://localhost:4321/claude-playbook
```

## Comandos

| Comando | O que faz |
|---|---|
| `pnpm dev` | Dev server com hot reload |
| `pnpm build` | Gera o site estático em `./dist` |
| `pnpm preview` | Servir o build para testar antes de publicar |

## Estrutura

```
src/
├── components/   # Cabeçalho, rodapé, cards, badges
├── content/
│   └── posts/    # Cada post é um arquivo .md
├── layouts/      # BaseLayout (geral) e PostLayout (post)
├── pages/        # Rotas em pt-BR: /, /artigos, /tags, /sobre, /404
├── styles/       # global.css com Tailwind v4 + tema
└── utils/
```

## Escrever um post novo

1. Crie `src/content/posts/<slug-em-portugues>.md`
2. Use o frontmatter:

```yaml
---
title: "Título do post"
description: "Subtítulo curto que aparece em listagens e meta tags."
date: 2026-04-27
tags: [claude-code, hooks]
---
```

3. `pnpm build` para validar schema antes de fazer push.

## Deploy

Push em `main` dispara GitHub Action → publica em GitHub Pages. Status no Actions tab do repo.

## Licença

MIT — fique à vontade pra forkar e fazer o seu próprio playbook.
