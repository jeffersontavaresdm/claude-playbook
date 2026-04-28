---
description: Cria um novo post do claude-playbook sobre o assunto fornecido — pesquisa fontes na web, ancora em uso prático com Claude, escreve em pt-BR, salva como rascunho, commita e pusha.
---

# /post — escrever um novo post do claude-playbook

**Argumentos:** `$ARGUMENTS` (assunto / título do post)

Você é o autor do `claude-playbook`. Crie um post novo sobre o assunto acima seguindo este fluxo. Não pule etapas.

---

## 1 — Pesquisar (3-5 fontes confiáveis)

Use **WebSearch** e **WebFetch** para coletar material atualizado. Priorize, nessa ordem:

1. **Papers no arXiv** (Anthropic, DeepMind, OpenAI, Google Research, Meta AI)
2. **Documentação oficial** (Anthropic docs, OpenAI cookbook, HuggingFace docs)
3. **Blogs técnicos respeitados** — Lilian Weng (`lilianweng.github.io`), Jay Alammar (`jalammar.github.io`), Simon Willison (`simonwillison.net`), Distill (`distill.pub`), Anthropic Engineering Blog
4. **Posts de pessoas-referência** no assunto (autores citados nos papers)

Anote 3-5 URLs concretas. Vão para a seção final **"Fontes"** do post.

Se WebSearch falhar/estiver indisponível, faça WebFetch direto em URLs canônicas conhecidas pelo seu treinamento.

---

## 2 — Decidir o framing

**Sempre ancorar em uso prático com Claude.** O leitor é alguém que já usa Claude e quer entender melhor pra usar melhor.

Estrutura mental:

> "por que isso importa pra trabalhar com Claude" → fundamento técnico → **implicação concreta** no fluxo do leitor

Não é tutorial puro nem academia. É "o que precisei entender pra usar a ferramenta melhor".

---

## 3 — Escrever (1500-2000 palavras, ~7-10 min de leitura)

**Tom da casa:**
- 1ª pessoa, pt-BR informal mas técnico — conversa entre devs
- Frases curtas. Parágrafos de 1-3 frases
- Bullets quando ficar mais legível
- Evite jargão de marketing ("revolucionário", "incrível", "game-changer")
- Códigos com linguagem (` ```ts `, ` ```py `, ` ```bash `, etc.)
- **Diagramas em ASCII art ou mermaid** (combina com tema terminal)

**Estrutura sugerida do post:**

1. **Abertura** (1-2 parágrafos) — gancho concreto: por que aprender isso te ajuda no uso do Claude
2. **Conceito explicado** — didático, com analogia se possível. Aqui mora o "fundamento"
3. **Detalhes técnicos relevantes** — só os que sustentam a próxima seção
4. **Implicações práticas** (a parte mais importante) — como esse fundamento muda decisões que você toma usando Claude. Bullets são bons aqui
5. **Quando ignorar** (opcional, mas valoriza) — limites do que foi aprendido
6. **Fontes** — lista das 3-5 URLs

---

## 4 — Slug e tags

**Slug:** kebab-case, sem acentos, descritivo, em pt-BR.
- ✅ `fundamentos-llm-arquitetura-transformer.md`
- ✅ `tokenizacao-por-que-pt-br-custa-mais.md`
- ❌ `transformer.md` (genérico demais)
- ❌ `meu-post-sobre-llms.md` (vazio)

**Tag base:** `fundamentos`. Combine com tag específica do tema (ex: `llm`, `tokenização`, `contexto`, `atenção`).

**Reuse tags existentes** antes de criar novas. Lista atual em `CLAUDE.md` §Padrões de tags.

---

## 5 — Frontmatter (obrigatório `draft: true`)

```yaml
---
title: "<título humano, sem aspas no original>"
description: "<subtítulo de 1-2 frases que aparece em listagens e meta tags>"
date: <YYYY-MM-DD da execução — use a data atual real>
tags: [fundamentos, <tag-específica>]
draft: true
---
```

`draft: true` é obrigatório no /post. O usuário vai revisar antes de publicar.

---

## 6 — Salvar

Caminho: `src/content/posts/<slug>.md`

---

## 7 — Validar, commitar, pushar

```bash
pnpm build       # garante que o schema bate
git add src/content/posts/<slug>.md
git commit -m "post: rascunho — <título>"
git push origin main
```

A Action vai rodar, mas **o post não aparece no site** porque está como `draft: true`.

---

## 8 — Reportar ao usuário

Mensagem final no chat (concisa):

```
Rascunho criado: src/content/posts/<slug>.md
Preview local: http://localhost:4321/claude-playbook/artigos/<slug> (rode `pnpm dev`)
Fontes: <3-5 links>

Leia e me avise quando aprovar — eu tiro o draft, commito como `feat: publica post — <título>` e pusho.
```

---

## Regra associada — quando o usuário aprovar

Se ele disser "publica", "tira o draft", "pode subir" ou equivalente referindo-se a este post:

1. Edita o frontmatter: troca `draft: true` por `draft: false` (ou remove a linha)
2. `pnpm build` pra revalidar
3. Commit: `feat: publica post — <título>`
4. Push em `main`
5. Confirma com o link público: `https://jeffersontavaresdm.github.io/claude-playbook/artigos/<slug>`
