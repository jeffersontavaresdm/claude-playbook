---
description: Cria um novo post do claude-playbook sobre o assunto fornecido. Detecta o tipo (fundamentos/prática/comparação/setup), pesquisa fontes, escreve em pt-BR no tom da casa, salva como rascunho, commita e pusha.
---

# /post — escrever um novo post do claude-playbook

**Argumentos:** `$ARGUMENTS` (assunto / título do post — qualquer tipo)

Você é o autor do `claude-playbook`. Crie um post novo sobre o assunto acima seguindo este fluxo. Não pule etapas.

---

## 1 — Detectar o tipo de post

Leia o título e classifique em **uma** das 4 categorias. Se ficar entre duas, escolha a que melhor responda à pergunta "o que o leitor leva embora?". Se nenhuma encaixar, use a estrutura mais próxima como base e ajuste.

| Tipo | Quando usar | Tag base | Estrutura |
|---|---|---|---|
| **fundamentos** | Teoria/conceito que ajuda a usar Claude (transformer, tokenização, contexto, atenção, embeddings, RAG, fine-tuning) | `fundamentos` + tag específica (`llm`, `tokenização`, etc.) | Por que importa pra usar Claude → fundamento → implicação prática → quando ignorar |
| **prática** | Fluxos, hooks, técnicas, rotinas que você aplica no dia a dia | `claude-code` + tag específica (`hooks`, `plan-mode`, `skills`, `fluxo`, `automação`) | Problema → como resolvi → trade-offs → o que removi/ajustei |
| **comparação** | A vs B (skills vs commands, plan mode vs direto, sonnet vs opus, etc.) | tag de cada lado da comparação | Critério de escolha → opção A → opção B (→ C) → quando cada uma → meu default |
| **setup** | Configurações, templates, arquivos de partida (CLAUDE.md, settings.json, hooks.json, .gitignore, etc.) | `settings` ou `claude-md` ou `documentação` | O que precisa cobrir → meu mínimo viável → opcional → exemplo completo |

Reporte ao usuário (1 linha) qual tipo escolheu e siga.

---

## 2 — Pesquisar (3-5 fontes confiáveis)

Use **WebSearch** e **WebFetch**. Adapte a pesquisa ao tipo:

- **fundamentos** → papers no arXiv, Lilian Weng, Jay Alammar, Distill, blogs de research (Anthropic, DeepMind, OpenAI)
- **prática** → docs oficiais Claude Code, Anthropic engineering blog, posts de Simon Willison e da comunidade, repos de exemplo no GitHub
- **comparação** → docs oficiais de cada lado, threads de comparação (HN, Reddit r/ClaudeAI, blogs)
- **setup** → docs oficiais, exemplos de configs em repos populares, templates da própria Anthropic

Anote 3-5 URLs concretas. Vão pra seção final **"Fontes"** do post.

Se WebSearch falhar/estiver indisponível, use WebFetch direto em URLs canônicas conhecidas.

---

## 3 — Decidir o framing

**Sempre ancorar em uso prático com Claude.** O leitor é alguém que já usa Claude e quer usar melhor.

Em qualquer tipo:
- Comece com **gancho concreto** — uma pergunta, problema ou fricção real
- Termine numa **decisão prática** — o leitor sai sabendo o que fazer diferente

Não é tutorial puro. Não é academia. É notebook de quem aplica.

---

## 4 — Escrever (1500-2000 palavras, ~7-10 min de leitura)

**Tom da casa (igual em todos os tipos):**
- 1ª pessoa, pt-BR informal mas técnico — conversa entre devs
- Frases curtas. Parágrafos de 1-3 frases
- Bullets quando ficar mais legível que prosa
- Evite jargão de marketing ("revolucionário", "incrível", "game-changer")
- Códigos com linguagem (` ```ts `, ` ```py `, ` ```bash `, ` ```json `)
- Diagramas em ASCII art ou mermaid (combina com tema terminal)
- Honestidade sobre incerteza > falsa confiança ("ainda testando", "funciona pra mim, talvez não pra você")

**Use a estrutura da tabela acima** correspondente ao tipo escolhido. Adapte se o assunto pedir, mas não invente estrutura genérica.

---

## 5 — Slug e tags

**Slug:** kebab-case, sem acentos, descritivo, em pt-BR.
- ✅ `fundamentos-llm-arquitetura-transformer.md`
- ✅ `hooks-de-notificacao-que-uso.md`
- ✅ `skills-vs-slash-commands-quando-cada-um.md`
- ❌ `transformer.md` (genérico)
- ❌ `meu-novo-post.md` (vazio)

**Tags:** combine a tag base do tipo (tabela §1) com 1-2 tags específicas. **Reuse tags existentes** antes de criar novas — lista atualizada em `CLAUDE.md` §"Padrões de tags".

---

## 6 — Frontmatter (obrigatório `draft: true`)

```yaml
---
title: "<título humano>"
description: "<subtítulo de 1-2 frases — aparece em listagens e meta tags>"
date: <YYYY-MM-DD da execução — use a data atual real>
tags: [<tag-base>, <tag-específica>]
draft: true
---
```

`draft: true` é **obrigatório** no `/post`. O usuário revisa antes de publicar.

---

## 7 — Salvar

Caminho: `src/content/posts/<slug>.md`

---

## 8 — Validar, commitar, pushar

```bash
pnpm build       # garante que o schema bate
git add src/content/posts/<slug>.md
git commit -m "post: rascunho — <título>"
git push origin main
```

A Action vai rodar, mas **o post não aparece no site** (está como `draft: true`).

---

## 9 — Reportar ao usuário

Mensagem final no chat (concisa):

```
Tipo: <fundamentos | prática | comparação | setup>
Rascunho: src/content/posts/<slug>.md
Preview local: http://localhost:4321/claude-playbook/artigos/<slug> (rode `pnpm dev`)
Fontes: <3-5 links>

Leia e me avise quando aprovar — eu tiro o draft, commito como `feat: publica post — <título>` e pusho.
```

---

## Regra associada — quando o usuário aprovar

Se ele disser "publica", "tira o draft", "pode subir" ou equivalente referindo-se ao post:

1. Edita o frontmatter: troca `draft: true` por `draft: false` (ou remove a linha)
2. `pnpm build` pra revalidar
3. Commit: `feat: publica post — <título>`
4. Push em `main`
5. Confirma com o link público: `https://jeffersontavaresdm.github.io/claude-playbook/artigos/<slug>`
